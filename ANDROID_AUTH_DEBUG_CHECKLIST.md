# Android Firebase Auth - Complete Debugging Checklist

## ✅ Your Gradle Configuration is PERFECT!
Your `build.gradle` files are correctly configured with:
- ✅ Google services plugin: `4.4.4`
- ✅ Firebase BOM: `33.1.0`
- ✅ Firebase Auth SDK
- ✅ Firebase Firestore SDK
- ✅ Plugin applied correctly

---

## 🔍 Step-by-Step Debug Process

### **Step 1: Firebase Console - CRITICAL CHECKS**

Go to Firebase Console → Your Project → **Authentication** → **Sign-in method**

**Enable these TWO providers (BOTH are required):**

1. **Phone** 
   - Status must be: **ENABLED** (green toggle)
   - NOT just "Added" - it must show ENABLED
   
2. **Email/Password**
   - Status must be: **ENABLED** (green toggle)
   - Email link (optional) can be disabled
   - Just basic Email/Password must be ENABLED

**Why both?** Our app creates email addresses like `+919876543210@dukaan.app` to link phone numbers with Firebase Auth.

---

### **Step 2: Check google-services.json Matches**

In Firebase Console → Project Settings → Your apps → Dukaan Android:

**Verify these match EXACTLY:**

Your `google-services.json` shows:
```
Package name: com.dukaan.quickcommerce
App ID: 1:344365593313:android:d88144fd18f79052bcbda0
```

Firebase Console should show the SAME package and App ID.

---

### **Step 3: SHA Fingerprints - MUST BE ADDED**

In Firebase Console → Project Settings → Your apps → Dukaan Android → scroll down:

You should see:
- ✅ SHA-1 fingerprint added
- ✅ SHA-256 fingerprint added

**If missing, get them with:**
```bash
cd android
./gradlew signingReport
```

Copy SHA-1 and SHA-256, then add them in Firebase Console.

---

### **Step 4: Add Test Phone Numbers (Skip SMS Charges)**

Firebase Console → Authentication → Settings → Phone numbers for testing

Add test numbers to bypass SMS during development:

Example:
- Phone: `+91 1234567890`
- Code: `123456`

Now you can test without real SMS!

---

### **Step 5: Rebuild Android App (CRITICAL)**

After ANY Firebase Console changes, you MUST rebuild:

```bash
# In your Replit terminal or local machine
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. Install fresh APK on device

---

### **Step 6: Test with Logcat to See Real Error**

While testing on device:

```bash
# Connect device via USB, enable USB debugging
adb logcat | grep -i "firebase\|auth\|recaptcha"
```

This shows the EXACT error causing the issue.

---

## 🔥 Common Causes of `auth/invalid-credential`

| Cause | Fix |
|-------|-----|
| Phone auth NOT enabled in Firebase Console | Enable it in Sign-in method |
| Email/Password NOT enabled | Enable it (required for our hybrid auth) |
| Old APK cached on device | Uninstall app, rebuild, reinstall fresh |
| SHA fingerprints missing in Firebase | Add SHA-1 and SHA-256 to Firebase Console |
| google-services.json not synced | Run `npx cap sync android` and rebuild |
| Package name mismatch | Verify `com.dukaan.quickcommerce` matches everywhere |

---

## 📱 Complete Test Flow

1. **Enable Phone + Email/Password in Firebase Console**
2. **Add SHA fingerprints if missing**
3. **Add test phone number** (`+91 1234567890` → code `123456`)
4. **Rebuild app completely** (clean + rebuild in Android Studio)
5. **Uninstall old app from device**
6. **Install fresh APK**
7. **Test with test phone number**
8. **If fails, check logcat** for exact error

---

## 🎯 Quick Test with Chrome DevTools

1. Connect device via USB
2. Open Chrome on computer
3. Go to `chrome://inspect/#devices`
4. Find your app's WebView
5. Click **Inspect**
6. See exact JavaScript error in Console tab

---

## ✅ What We've Configured

Your Android setup is NOW complete with:
- ✅ Native Firebase Auth SDK
- ✅ Native Firestore SDK
- ✅ Google services plugin
- ✅ WebView configuration for reCAPTCHA
- ✅ Cleartext traffic enabled
- ✅ Third-party cookies enabled

**Next: Follow the checklist above and report back the exact error from logcat or Chrome DevTools!**
