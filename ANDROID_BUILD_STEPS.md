# 🚀 Quick Android Build Guide

## ⚠️ **Critical Fix Applied**

Network security config added to fix backend connection issues in Android.

---

## 📱 **Build Steps for Android**

### 1️⃣ **Pull Latest Changes from Git**
```bash
git pull origin main
```

### 2️⃣ **Set Environment Variables**
```bash
# Copy and paste these exact commands:
export VITE_GEMINI_API_KEY="your_actual_gemini_api_key_here"
export VITE_BACKEND_URL="https://554d64f2-8fb7-47e9-8f40-3960b62a30a8-00-l8y60wt4t9mh.kirk.replit.dev:8000"
```

### 3️⃣ **Build Frontend**
```bash
npm install
npm run build
```

### 4️⃣ **Sync with Capacitor**
```bash
npx cap sync android
```

### 5️⃣ **Open in Android Studio**
```bash
npx cap open android
```

### 6️⃣ **In Android Studio**
- Wait for Gradle sync to complete (may take 2-5 minutes first time)
- Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 7️⃣ **Install on Device**
```bash
# Via USB:
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or transfer APK to phone and install manually
```

---

## 🔑 **First Launch Setup**

When you first open the app:

### 1. **Location Permission**
- App will ask: "Allow DUKAAN to access this device's location?"
- **Tap "While using the app"** ✅
- This enables "Use My Location" feature

### 2. **Microphone Permission** (for voice shopping)
- When you use voice search, app will ask for microphone access
- **Tap "Allow"** ✅

---

## 🧪 **Testing Checklist**

After installation, test these features:

### ✅ **OTP Login**
1. Enter your phone number: `+91 7993558836`
2. Click "Continue"
3. **Real SMS should arrive** (check your phone messages)
4. Enter OTP from SMS
5. Complete profile setup

### ✅ **Address Auto-Detection**
1. Go to Profile → Addresses → Add New Address
2. Click **"Use My Location"** (green button)
3. Grant location permission if prompted
4. **Should show actual street address** (not coordinates!)

### ✅ **Voice Shopping**
1. On home screen, click microphone icon
2. Grant microphone permission if prompted
3. Say: "I want tomatoes and onions"
4. Should transcribe and search for products

### ✅ **Language Toggle**
1. Click language button (top right)
2. Switch to తెలుగు (Telugu)
3. All UI text should change to Telugu

---

## 🐛 **If You See Errors**

### **"Failed to fetch" Error**
- Backend must be running on Replit
- Check backend status: https://554d64f2-8fb7-47e9-8f40-3960b62a30a8-00-l8y60wt4t9mh.kirk.replit.dev:8000/health
- Make sure you set `VITE_BACKEND_URL` before building

### **"Geolocation error"**
- Check location permission: Settings → Apps → DUKAAN → Permissions → Location
- Enable "Allow only while using the app"
- Make sure GPS is turned on

### **Network Security Error**
- Already fixed! Just rebuild with latest code

---

## 📊 **Debug with Chrome DevTools**

To see console logs from your Android device:

1. Enable USB debugging on phone
2. Connect phone to computer via USB
3. Open Chrome browser
4. Go to: `chrome://inspect`
5. Find your app and click "Inspect"
6. See real-time console logs!

---

## 🎯 **Production Checklist** (Before Release)

- [ ] Replace Gemini API key with production key
- [ ] Add rate limiting to backend
- [ ] Migrate OTP storage from in-memory to Redis/Firestore
- [ ] Enable Firebase custom token generation
- [ ] Remove test mode endpoints
- [ ] Generate signed APK (not debug APK)
- [ ] Test on multiple Android versions
- [ ] Add app icon and splash screen customization

---

**Need help?** Check logs with: `adb logcat | grep "Capacitor"`
