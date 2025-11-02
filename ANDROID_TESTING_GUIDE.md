# Android Testing & Troubleshooting Guide

## ✅ FIXED: Mode Switching in Mobile App

**Problem:** No URL bar in native app to add `?mode=shopkeeper` or `?mode=rider`

**Solution:** Added in-app mode switcher!

### How to Switch Modes:
1. **Login as Customer** (default view)
2. **Go to Profile tab** (bottom navigation)
3. **Scroll down to "Switch Mode" section**
4. **Tap "Shopkeeper Dashboard"** or **"Rider Dashboard"**
5. **App will reload in that mode**

Now you can access all three interfaces from within the app!

---

## 🔥 Firebase Auth Error Fix

### Problem: `auth/invalid-credential` in Android

This happens because Firebase doesn't recognize your Android app. Here's the complete fix:

### Step 1: Get Your SHA-1 Fingerprint

Open **Terminal in Android Studio** (bottom panel) and run:

**Windows:**
```bash
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

**Mac/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Copy the SHA-1** (looks like: `A1:B2:C3:D4:E5...`)

### Step 2: Add SHA-1 to Firebase Console

1. Go to: https://console.firebase.google.com
2. Select your Dukaan project
3. Click **⚙️ (Settings) → Project settings**
4. Scroll to **"Your apps"** section
5. Find your Android app (`com.dukaan.quickcommerce`)
6. Click **"Add fingerprint"**
7. Paste your SHA-1
8. Click **Save**

### Step 3: Download NEW google-services.json

1. In the same page, scroll down
2. Click **"Download google-services.json"**
3. **Replace** the old file in `android/app/google-services.json`

### Step 4: Rebuild the App

In Android Studio:
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. Click **Run** (green play button)

**Auth should now work!**

---

## 🧪 Testing Checklist

### Test in Emulator/Phone:

1. **Customer Mode:**
   - ✅ Login with phone number
   - ✅ Browse products
   - ✅ Add to cart
   - ✅ Place order
   - ✅ Voice shopping works
   - ✅ Switch to Shopkeeper/Rider mode from Profile

2. **Shopkeeper Mode:**
   - ✅ Login from mode switcher
   - ✅ View orders
   - ✅ Manage products
   - ✅ Assign riders
   - ✅ Update order status

3. **Rider Mode:**
   - ✅ Login from mode switcher
   - ✅ View assigned orders
   - ✅ Update delivery status
   - ✅ Google Maps navigation works

---

## 🔧 Common Issues & Fixes

### Issue: "App keeps crashing"
**Fix:** Check Logcat in Android Studio for error messages. Usually Firebase config issue.

### Issue: "White screen on launch"
**Fix:** 
```bash
cd android
./gradlew clean
cd ..
npm run build
npx cap sync
```
Then rebuild in Android Studio.

### Issue: "Network request failed"
**Fix:** Make sure emulator/phone has internet connection. Check Firebase rules allow read/write.

### Issue: "Voice shopping doesn't work"
**Fix:** Grant microphone permission when prompted. Check Settings → Apps → Dukaan → Permissions.

### Issue: "Location not working for riders"
**Fix:** Grant location permission. Enable GPS on device.

---

## 📱 Testing on Physical Phone vs Emulator

### Emulator Limitations:
- ❌ No real camera (can't test image uploads fully)
- ❌ Simulated GPS (delivery tracking less accurate)
- ⚠️ Voice recognition may not work well

### Physical Phone Advantages:
- ✅ Real camera for product images
- ✅ Accurate GPS for delivery tracking
- ✅ Better voice recognition
- ✅ Real-world performance testing

**Recommendation:** Test on physical phone for final validation.

---

## 🚀 Next Steps After Testing

1. **Test all three modes** thoroughly
2. **Fix any bugs** you find
3. **Customize app icon** (see MOBILE_DEPLOYMENT.md)
4. **Build signed APK** for Play Store
5. **Submit to Play Store**

---

## 📞 Quick Reference

**Package Name:** `com.dukaan.quickcommerce`

**Firebase Setup:** 
- Android app must be added to Firebase Console
- SHA-1 fingerprint required
- google-services.json must be in `android/app/`

**Mode Switching:**
- From Profile tab → "Switch Mode" section
- Works in native app without URL parameters

**Rebuild Command:**
```bash
npm run build && npx cap sync
```

---

Good luck with testing! 🎉
