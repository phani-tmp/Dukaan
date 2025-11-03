# Android Testing & Troubleshooting Guide

## ✅ FIXED: Mode Switching in Mobile App

**Problem:** No URL bar in native app to add `?mode=shopkeeper` or `?mode=rider`

**Solution:** Added in-app mode switcher in all three interfaces!

### How to Switch Modes:

**From Customer App:**
1. **Login as Customer** (default view)
2. **Go to Profile tab** (bottom navigation)
3. **Scroll down to "Switch Mode" section**
4. **Tap "Shopkeeper Dashboard"** or **"Rider Dashboard"**
5. **App will reload in that mode**

**From Rider Dashboard:**
1. **Scroll to bottom** of rider dashboard
2. **See "Switch Mode" section**
3. **Tap "Customer App"** or **"Shopkeeper Dashboard"**

**From Shopkeeper Dashboard:**
1. **Go to Settings tab**
2. **Scroll to bottom**
3. **See "Switch Mode" section**
4. **Tap "Customer App"** or **"Rider Dashboard"**

Now you can access all three interfaces from within the app!

---

## 🔥 Firebase Auth Error Fix

### Problem: `auth/invalid-credential` in Android

This is the **#1 issue** when testing on Android. Firebase doesn't recognize your Android app because of missing SHA-1 fingerprint. Here's the COMPLETE fix:

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

**Auth should now work!** ✅

### Why This Happens:

Firebase uses SHA-1 fingerprints to verify that requests are coming from your app (not an imposter). Each development machine has a unique debug keystore, so you need to add YOUR specific SHA-1 to Firebase.

### Common Mistakes:

❌ **Copying SHA-1 from online** - Won't work! Each developer has their own.
❌ **Skipping google-services.json download** - Old file won't have new fingerprint.
❌ **Not rebuilding** - Android Studio needs to compile with new config.

### If It Still Doesn't Work:

1. **Check you're using the RIGHT Firebase project** (dukaan-476221)
2. **Verify you added SHA-1 to the ANDROID app** (not iOS or web)
3. **Make sure google-services.json is in `android/app/`** (not `android/`)
4. **Clear app data and reinstall:**
   - Settings → Apps → Dukaan → Storage → Clear Data
   - Uninstall app from device
   - Rebuild and reinstall

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

## 🔧 Complete Troubleshooting Guide

### Issue: "Profile creation not appearing after OTP"

**Symptoms:** After entering OTP, screen doesn't show registration form.

**Causes:**
1. Firebase auth succeeds but React state doesn't update
2. Android WebView cache issues
3. JavaScript errors blocking UI

**Fix:**
```bash
# Clear and rebuild
npm run build
npx cap sync
```

Then in Android Studio:
1. **Build → Clean Project**
2. **Build → Rebuild Project**
3. **Uninstall app from device**
4. **Run app again**

**Also check:**
- Open Chrome DevTools for Android WebView: `chrome://inspect/#devices`
- Look for JavaScript errors in console
- Make sure `authStep` state changes to 'register'

---

### Issue: "App keeps crashing on startup"

**Fix:** Check Logcat in Android Studio:
1. **View → Tool Windows → Logcat**
2. **Filter by package name:** `com.dukaan.quickcommerce`
3. **Look for red ERROR lines**

**Common crash causes:**
- Missing `google-services.json` file
- Firebase SDK version mismatch
- Missing internet permission (check `AndroidManifest.xml`)

---

### Issue: "White screen on launch / App stuck loading"

**Fix #1 - Clear and rebuild:**
```bash
cd android
./gradlew clean
cd ..
npm run build
npx cap sync
```
Then rebuild in Android Studio.

**Fix #2 - Check WebView:**
1. Connect device via USB
2. Open Chrome on desktop
3. Go to `chrome://inspect/#devices`
4. Find your device and click "inspect"
5. Check for errors in Console

**Fix #3 - Check network:**
- Make sure device has internet
- Check Firebase Security Rules allow read/write:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For testing only!
    }
  }
}
```

---

### Issue: "Voice shopping doesn't work"

**Fix:**
1. **Grant microphone permission:**
   - Settings → Apps → Dukaan → Permissions → Microphone → Allow
2. **Test microphone works:**
   - Open voice recorder app and test mic
3. **Check Gemini API key is set:**
   - Make sure `GEMINI_API_KEY` is in environment variables
4. **Check internet connection**

---

### Issue: "Location not working for riders"

**Fix:**
1. **Grant location permission:**
   - Settings → Apps → Dukaan → Permissions → Location → Allow all the time
2. **Enable GPS:**
   - Pull down notification shade
   - Turn on Location services
3. **For emulator:**
   - Click ... (more) → Location → Set custom location

---

### Issue: "Firestore errors / Data not loading"

**Error:** `FirebaseError: Missing or insufficient permissions`

**Fix:**
1. **Check Firestore Security Rules:**
   - Go to Firebase Console → Firestore Database → Rules
   - For TESTING, use permissive rules (change for production!):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click **Publish**

2. **Check internet connection on device**

3. **Clear app data and retry:**
   - Settings → Apps → Dukaan → Storage → Clear Data

---

### Issue: "Images not displaying"

**Causes:**
- HTTP images blocked (Android requires HTTPS)
- Network Security Config missing
- Image URLs broken

**Fix:**
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application
  android:usesCleartextTraffic="true"
  ...>
```

---

### Issue: "Can't switch between Customer/Rider/Shopkeeper modes"

**Check:**
1. **Mode switching buttons visible?**
   - Customer: Profile tab → Scroll down
   - Rider: Dashboard → Scroll to bottom
   - Shopkeeper: Settings tab → Scroll to bottom

2. **App reloading after tap?**
   - Should reload with new URL
   - Check Chrome inspector for errors

---

### Issue: "CSS looks broken on mobile"

**Fix:** Rebuild with latest mobile-optimized CSS:
```bash
npm run build
npx cap sync
```

**Mobile CSS now includes:**
- ✅ Proper touch targets (44px minimum)
- ✅ Responsive font sizes (16px to prevent zoom)
- ✅ Optimized spacing for small screens
- ✅ Better stat cards layout
- ✅ Scrollable tabs with swipe

---

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
