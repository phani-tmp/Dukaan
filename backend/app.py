from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
import requests
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth

load_dotenv()

app = FastAPI(title="Dukaan OTP Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

firebase_app = None

try:
    # Initialize Firebase Admin SDK for Custom Token generation
    # Using Workload Identity Federation (Application Default Credentials)
    cred = credentials.ApplicationDefault()
    firebase_app = firebase_admin.initialize_app(cred, {
        'projectId': 'dukaan-476221'
    })
    print("✅ Firebase Admin SDK initialized for custom token generation")
    print("✅ Service Account: firebase-adminsdk-fbsvc@dukaan-476221.iam.gserviceaccount.com")
except Exception as e:
    print(f"⚠️  Firebase initialization error: {e}")
    print("Custom token generation may not work without proper credentials.")

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")
FAST2SMS_SENDER_ID = os.getenv("FAST2SMS_SENDER_ID", "DUKAAN")

# In-memory OTP storage (will migrate to Redis/Firestore later)
OTP_STORE = {}

class OTPRequest(BaseModel):
    phone: str

class VerifyRequest(BaseModel):
    phone: str
    otp: str

def generate_otp():
    return str(random.randint(100000, 999999))

def send_sms_fast2sms(phone: str, otp: str):
    if not FAST2SMS_API_KEY:
        raise HTTPException(status_code=500, detail="Fast2SMS API key not configured")
    
    phone_clean = phone.replace("+91", "").replace("+", "").strip()
    
    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = {
        "route": "q",
        "message": f"Your DUKAAN verification code is {otp}. Valid for 5 minutes. Do not share with anyone.",
        "language": "english",
        "flash": 0,
        "numbers": phone_clean
    }
    headers = {
        "authorization": FAST2SMS_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers, timeout=10)
        print(f"Fast2SMS Response: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get("return") == True:
                return True
            else:
                raise HTTPException(status_code=500, detail=f"SMS send failed: {result.get('message')}")
        else:
            raise HTTPException(status_code=500, detail=f"SMS gateway error: {response.status_code}")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"SMS request failed: {str(e)}")

@app.get("/")
def root():
    return {
        "service": "Dukaan OTP Service",
        "status": "running",
        "firebase_admin": "initialized" if firebase_app else "not initialized",
        "fast2sms": "configured" if FAST2SMS_API_KEY else "not configured",
        "otp_storage": "in-memory (will migrate to Redis/Firestore)",
        "active_otps": len(OTP_STORE)
    }

@app.post("/send-otp")
def send_otp(data: OTPRequest):
    """Send OTP via Fast2SMS and store in memory"""
    try:
        otp = generate_otp()
        expiry = int(time.time()) + 300
        
        # Store OTP in memory (will migrate to Redis/Firestore later)
        OTP_STORE[data.phone] = {
            "otp": otp,
            "expiry": expiry,
            "created_at": int(time.time())
        }
        
        print(f"📱 Sending OTP {otp} to {data.phone}")
        
        send_sms_fast2sms(data.phone, otp)
        
        return {
            "message": "OTP sent successfully",
            "phone": data.phone,
            "expires_in": 300
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending OTP: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send-otp-test")
def send_otp_test(data: OTPRequest):
    """Test endpoint that stores OTP without sending SMS - for development only"""
    try:
        otp = generate_otp()
        expiry = int(time.time()) + 300
        
        # Store OTP in memory
        OTP_STORE[data.phone] = {
            "otp": otp,
            "expiry": expiry,
            "created_at": int(time.time())
        }
        
        print(f"🧪 TEST MODE: OTP {otp} stored for {data.phone} (no SMS sent)")
        
        return {
            "message": "OTP stored successfully (TEST MODE - no SMS sent)",
            "phone": data.phone,
            "otp": otp,
            "expires_in": 300
        }
    except Exception as e:
        print(f"Error storing OTP: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/verify-otp")
def verify_otp(data: VerifyRequest):
    """Verify OTP and return Firebase custom token"""
    try:
        # Check if OTP exists in memory
        record = OTP_STORE.get(data.phone)
        
        if not record:
            raise HTTPException(status_code=404, detail="OTP not found. Please request a new OTP.")
        
        current_time = int(time.time())
        
        # Check if OTP expired
        if current_time > record["expiry"]:
            del OTP_STORE[data.phone]
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")
        
        # Verify OTP
        if data.otp != record["otp"]:
            raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
        
        # Delete OTP after successful verification
        del OTP_STORE[data.phone]
        
        uid = f"user_{data.phone.replace('+', '')}"
        
        # TODO: Add Firebase custom token generation when credentials are properly configured
        # For now, return success without custom token
        # Frontend should use Firebase client SDK's phone auth or anonymous auth temporarily
        
        return {
            "message": "OTP verified successfully",
            "status": "success",
            "phone": data.phone,
            "uid": uid,
            "note": "Custom token generation will be added once Firebase credentials are configured"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "firebase_admin": "initialized" if firebase_app else "not initialized",
        "fast2sms": "configured" if FAST2SMS_API_KEY else "not configured",
        "timestamp": int(time.time())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

@app.get("/geocode")
async def geocode_location(lat: float = Query(...), lon: float = Query(...)):
    """
    Reverse geocode coordinates to get address
    Proxies request to OpenStreetMap to avoid CORS issues
    """
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&addressdetails=1"
        headers = {
            "User-Agent": "DUKAAN-App/1.0 (https://dukaan.replit.app)"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "status": "success",
                "address": data.get("display_name", f"{lat}, {lon}"),
                "details": data
            }
        else:
            return {
                "status": "error",
                "address": f"{lat}, {lon}",
                "message": f"Geocoding service returned {response.status_code}"
            }
    except Exception as e:
        print(f"Geocoding error: {e}")
        return {
            "status": "error",
            "address": f"{lat}, {lon}",
            "message": str(e)
        }
