# Dukaan Mobile App Deployment Guide

## Overview
Your Dukaan app is now configured for Android deployment using Capacitor. Both web and mobile apps run from the same codebase - **no separate apps needed** for customers, riders, and shopkeepers!

## How It Works
- **Single App**: One Android app serves all three interfaces (customer, rider, shopkeeper)
- **Mode Switching**: Users switch modes within the app (same as web version)
- **Web Still Works**: Your web version at port 5000 continues working exactly as before
- **Shared Codebase**: Any code changes automatically apply to both web and mobile

## Quick Testing Steps

### Option 1: Test on Android Studio Emulator (Recommended for Development)

1. **Install Android Studio** (if not already installed):
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API 34 or higher)
   - Create an Android Virtual Device (AVD)

2. **Open the Android Project**:
   ```bash
   npm run cap:android
   ```
   This will:
   - Build your web app
   - Sync to Android
   - Open Android Studio with your project

3. **Run in Android Studio**:
   - Click the green "Run" button
   - Select your emulator device
   - App will launch in the emulator

### Option 2: Test on Physical Android Device

1. **Enable Developer Mode** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer Options will be enabled

2. **Enable USB Debugging**:
   - Settings → Developer Options
   - Turn on "USB Debugging"

3. **Connect Phone to Computer**:
   - Connect via USB
   - Allow USB debugging when prompted

4. **Build and Run**:
   ```bash
   npm run cap:android
   ```
   - In Android Studio, select your physical device
   - Click "Run"

## Making Updates

### Update the App After Code Changes:

```bash
npm run cap:sync
```

This command:
1. Builds your React app (`npm run build`)
2. Copies the build to Android (`npx cap sync`)

### Open Android Studio Anytime:

```bash
npx cap open android
```

## Firebase Mobile Configuration (IMPORTANT!)

Your Firebase web app will work in the mobile app, but for production you should add Android to your Firebase project:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your Dukaan project**
3. **Click "Add App" → Android**
4. **Enter Package Name**: `com.dukaan.quickcommerce`
5. **Download `google-services.json`**
6. **Place the file here**: `android/app/google-services.json`
7. **Rebuild**: `npm run cap:sync`

This enables:
- Better Firebase performance on mobile
- Push notifications (future feature)
- Firebase Analytics
- Proper mobile authentication

## App Icon and Splash Screen

### Current Setup:
- Default Capacitor icons (green background)
- Green splash screen (2 second display)

### To Customize Icons:

1. **Create Your Icons** (or use online generator):
   - Recommended: https://www.appicon.co/
   - Upload your Dukaan logo
   - Download the Android icon pack

2. **Replace Icons**:
   - Copy generated icons to: `android/app/src/main/res/`
   - Folders: `mipmap-hdpi`, `mipmap-mdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`

3. **Rebuild**:
   ```bash
   npm run cap:sync
   ```

## Building for Play Store Release

### Step 1: Generate Signed APK

1. **In Android Studio**:
   - Build → Generate Signed Bundle / APK
   - Select "APK"
   - Create new keystore (save it securely!)
   - Fill in keystore details
   - Select "release" build variant

2. **Your APK will be created** at:
   `android/app/release/app-release.apk`

### Step 2: Upload to Play Store

1. **Create Play Console Account**:
   - Go to: https://play.google.com/console
   - Pay one-time $25 registration fee

2. **Create New App**:
   - Enter app details (name, description, screenshots)
   - Upload the signed APK
   - Fill in store listing details

3. **Submit for Review**:
   - Google reviews (typically 1-3 days)
   - Once approved, your app goes live!

## App Permissions Explained

Your app requests these permissions:

- **Internet**: Required for Firebase and API calls
- **Network State**: Check if device is online
- **Camera**: For uploading product images (shopkeeper mode)
- **Storage**: Save images locally
- **Microphone**: Voice shopping feature
- **Location**: Delivery tracking (rider mode)

All permissions are optional except Internet.

## Troubleshooting

### Build Fails:
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run build
npx cap sync
```

### App Doesn't Update:
```bash
# Force full rebuild
npm run build
npx cap sync
npx cap open android
# Then click "Rebuild Project" in Android Studio
```

### Firebase Not Working:
- Ensure `google-services.json` is in `android/app/`
- Check Firebase Console has Android app configured
- Package name must match: `com.dukaan.quickcommerce`

## Important Notes

1. **Testing on Real Device is Best**: Emulators don't support all features (camera, GPS, voice)

2. **Single App for All Modes**: 
   - Customers open the app normally
   - Riders/Shopkeepers use the mode switcher (same as web)
   - No need for separate apps!

3. **Web and Mobile Stay in Sync**: 
   - All code changes apply to both
   - No separate development needed

4. **Voice Features**: 
   - Gemini AI works in mobile
   - Requires microphone permission

5. **Offline Support**: 
   - Firebase caches data automatically
   - App works offline for basic browsing

## Next Steps

1. **Test the app** on emulator or physical device
2. **Add Firebase Android config** for production
3. **Customize app icon** with your Dukaan logo
4. **Test all features**: ordering, voice shopping, rider dashboard
5. **Build signed APK** for Play Store
6. **Create Play Store listing**
7. **Submit for review**

## App Store Details Template

**App Name**: Dukaan - Quick Commerce

**Short Description**: Fast grocery & essential delivery in Telugu villages

**Full Description**:
```
Dukaan (దుకాణ్) brings quick commerce to your neighborhood! Order groceries, medicines, and essentials with 10-minute delivery.

Features:
✓ Bilingual support (English/Telugu)
✓ Voice shopping with AI
✓ Multiple payment options
✓ Home delivery or store pickup
✓ Real-time order tracking
✓ For customers, shopkeepers, and delivery riders

Shop local, shop fast with Dukaan!
```

**Category**: Shopping
**Content Rating**: Everyone
**Contact Email**: [Your email]

---

Need help? Check Capacitor docs: https://capacitorjs.com/docs
