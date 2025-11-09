from fastapi import FastAPI, HTTPException
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
db = None

try:
    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase initialized successfully")
    else:
        print("⚠️  Firebase service account key not found. Please add serviceAccountKey.json")
except Exception as e:
    print(f"⚠️  Firebase initialization error: {e}")

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")

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
        "firebase": "connected" if db else "not configured",
        "fast2sms": "configured" if FAST2SMS_API_KEY else "not configured"
    }

@app.post("/send-otp")
def send_otp(data: OTPRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Firebase not configured")
    
    try:
        otp = generate_otp()
        expiry = int(time.time()) + 300
        
        db.collection("otp_codes").document(data.phone).set({
            "otp": otp,
            "expiry": expiry,
            "created_at": int(time.time())
        })
        
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

@app.post("/verify-otp")
def verify_otp(data: VerifyRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Firebase not configured")
    
    try:
        doc = db.collection("otp_codes").document(data.phone).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="OTP not found. Please request a new OTP.")
        
        record = doc.to_dict()
        current_time = int(time.time())
        
        if current_time > record["expiry"]:
            db.collection("otp_codes").document(data.phone).delete()
            raise HTTPException(status_code=400, detail="OTP expired. Please request a new OTP.")
        
        if data.otp != record["otp"]:
            raise HTTPException(status_code=400, detail="Invalid OTP. Please try again.")
        
        db.collection("otp_codes").document(data.phone).delete()
        
        try:
            custom_token = auth.create_custom_token(data.phone)
            custom_token_str = custom_token.decode('utf-8')
        except Exception as e:
            print(f"Warning: Could not create custom token: {e}")
            custom_token_str = None
        
        return {
            "message": "OTP verified successfully",
            "status": "success",
            "phone": data.phone,
            "custom_token": custom_token_str
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
        "firebase": "connected" if db else "disconnected",
        "timestamp": int(time.time())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
