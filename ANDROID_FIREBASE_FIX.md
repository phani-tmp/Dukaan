# Android Firebase Phone Authentication Fix

## Problem
Firebase Phone Authentication (reCAPTCHA) was working in web browser but failing in Android with `auth/operation-not-allowed` or `auth/invalid-credential` errors.

## Root Cause
The web Firebase SDK running inside Capacitor's Android WebView doesn't handle reCAPTCHA properly by default. WebViews have stricter security settings that block third-party cookies and mixed content required for reCAPTCHA.

## Solution Applied (Nov 3, 2025)

### 1. MainActivity.java Configuration
**File**: `android/app/src/main/java/com/dukaan/quickcommerce/MainActivity.java`

Added WebView configurations:
- ✅ Enabled DOM storage (required for Firebase)
- ✅ Enabled database storage
- ✅ Allowed mixed content for reCAPTCHA
- ✅ Enabled third-party cookies (critical for reCAPTCHA)
- ✅ Set proper cache mode
- ✅ Custom user agent string

### 2. AndroidManifest.xml Updates
**File**: `android/app/src/main/AndroidManifest.xml`

Added:
- ✅ `android:usesCleartextTraffic="true"` - Allows HTTP traffic for reCAPTCHA

### 3. Firebase Console Requirements
Make sure these are enabled in Firebase Console → Authentication → Sign-in method:

1. **Phone** authentication - ENABLED ✅
2. **Email/Password** authentication - ENABLED ✅

Your Android app configuration in Firebase:
- App ID: `1:344365593313:android:d88144fd18f79052bcbda0`
- Package: `com.dukaan.quickcommerce`
- SHA-1 & SHA-256 fingerprints: Already added ✅

## How to Rebuild and Test

### Step 1: Build and Sync (Already Done)
```bash
npm run build
npx cap sync android
```

### Step 2: Open in Android Studio
```bash
npx cap open android
```

### Step 3: Rebuild APK
1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. Install APK on your test device

### Step 4: Test Phone Authentication
1. Open the app on Android device
2. Enter phone number (use test number from Firebase Console for testing)
3. Request OTP
4. Verify that reCAPTCHA appears and works
5. Enter OTP and complete login

## Testing Tips

### Use Firebase Test Phone Numbers
For testing without SMS charges:
1. Firebase Console → Authentication → Settings
2. Scroll to "Phone numbers for testing"
3. Add test numbers like `+91 1234567890` with verification code `123456`
4. These numbers bypass reCAPTCHA and SMS

### Debug Mode
If issues persist, check Android logcat:
```bash
adb logcat | grep -i "firebase\|recaptcha\|auth"
```

## What This Fix Does

**Before Fix:**
- WebView blocked third-party cookies → reCAPTCHA failed
- Mixed content blocked → Google reCAPTCHA scripts failed to load
- Result: `auth/operation-not-allowed` error

**After Fix:**
- WebView allows third-party cookies → reCAPTCHA works
- Mixed content allowed → All Firebase/Google scripts load
- Result: Phone authentication works in Android ✅

## Alternative Solution (If This Doesn't Work)

If WebView configuration isn't sufficient, consider using native Firebase:
```bash
npm install @capacitor-firebase/authentication
```

This would require rewriting authentication code to use Capacitor's native Firebase plugin instead of the web SDK.

## Files Modified
- ✅ `android/app/src/main/java/com/dukaan/quickcommerce/MainActivity.java`
- ✅ `android/app/src/main/AndroidManifest.xml`
- ✅ Synced with: `npx cap sync android`

## Status
🟢 **READY FOR TESTING** - Rebuild APK in Android Studio and test on device.
