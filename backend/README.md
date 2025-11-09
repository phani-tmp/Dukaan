# Dukaan OTP Backend Service

Production-grade OTP verification system using Fast2SMS and Firebase.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Fast2SMS
1. Sign up at https://www.fast2sms.com
2. Get your API key from: https://www.fast2sms.com/dashboard/dev-api
3. Create `.env` file in this directory:
```env
FAST2SMS_API_KEY=your_actual_api_key_here
```

### 3. Add Firebase Service Account
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in this directory

### 4. Run the Server
```bash
python app.py
```
Or with uvicorn:
```bash
uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

## API Endpoints

### Send OTP
```bash
POST /send-otp
Content-Type: application/json

{
  "phone": "+919999999999"
}
```

### Verify OTP
```bash
POST /verify-otp
Content-Type: application/json

{
  "phone": "+919999999999",
  "otp": "123456"
}
```

### Health Check
```bash
GET /health
```

## Security Features
- ✅ OTP expires after 5 minutes
- ✅ OTP deleted after verification (one-time use)
- ✅ CORS enabled for frontend integration
- ✅ Firebase custom tokens for session management
- ✅ Clean phone number handling (+91 prefix)

## Frontend Integration
See the main app's authentication service for integration examples.
