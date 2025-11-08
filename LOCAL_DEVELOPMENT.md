# Local Development Guide - Working Outside Replit

## 🏠 Setting Up for Local Development

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Android Studio** (latest version, 2024.x)
3. **Java JDK 17** (required for Android builds)
4. **Git** (for version control)

---

## 📥 Initial Setup

### 1. Download Your Project from Replit
```bash
# Option A: Download as ZIP from Replit
Right-click project folder → Download as ZIP → Extract

# Option B: Git clone (if you pushed to GitHub)
git clone https://github.com/yourusername/dukaan.git
cd dukaan
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` file in project root:
```bash
VITE_GEMINI_API_KEY=AIzaSyAVBBw2bRGN8JUjZZyfjYIScdpwv6pGx9c
```

---

## 🌐 Web Development (Browser)

### Start Development Server
```bash
npm run dev
```

Open browser: `http://localhost:5000`

### What Works in Browser:
✅ Login (phone + OTP)
✅ Product browsing
✅ Cart & checkout
✅ Orders
✅ Shopkeeper dashboard
✅ Rider dashboard
✅ Voice search (uses browser MediaRecorder API)
✅ AI semantic search
✅ Geolocation

### Making Changes:
1. Edit files in `/src`
2. Changes auto-reload (hot module replacement)
3. Check browser console for errors (F12)

---

## 📱 Android Development

### Setup Android Studio

#### 1. Install Java JDK 17
**Windows:**
```
Download from: https://www.oracle.com/java/technologies/downloads/#java17
Add to PATH: C:\Program Files\Java\jdk-17\bin
Set JAVA_HOME: C:\Program Files\Java\jdk-17
```

**Mac:**
```bash
brew install openjdk@17
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
```

#### 2. Install Android Studio
Download from: https://developer.android.com/studio

During setup, install:
- Android SDK
- Android SDK Platform-Tools
- Android Emulator

#### 3. Set Environment Variables
**Windows:**
```
ANDROID_HOME: C:\Users\YourName\AppData\Local\Android\Sdk
Add to PATH: %ANDROID_HOME%\platform-tools
```

**Mac/Linux:**
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
```

### Build for Android

#### Step 1: Build Web App
```bash
# CRITICAL: Use inline env var (Vite doesn't load .env during build)
VITE_GEMINI_API_KEY="AIzaSyAVBBw2bRGN8JUjZZyfjYIScdpwv6pGx9c" npm run build
```

#### Step 2: Sync to Android
```bash
npx cap sync android
```

This copies `/dist` → `/android/app/src/main/assets/public/`

#### Step 3: Open in Android Studio
```bash
npx cap open android
```

Or manually: `File → Open → Select /android folder`

#### Step 4: Sync Gradle
**CRITICAL STEP - Don't skip this!**
- Click the **Elephant icon** 🐘 in the top toolbar
- Or: `File → Sync Project with Gradle Files`
- Wait for sync to complete (check bottom status bar)

#### Step 5: Build & Run
**Android Studio 2024 (Meerkat):**
1. `Build → Clean Project`
2. `Build → Make Project`
3. Click green ▶️ Run button

**Older versions:**
1. `Build → Rebuild Project`
2. Click green ▶️ Run button

### Testing on Physical Device

#### Enable USB Debugging:
1. On your Android phone:
   - Settings → About Phone
   - Tap "Build Number" 7 times (enables Developer Mode)
   - Settings → Developer Options
   - Enable "USB Debugging"

2. Connect phone via USB
3. Phone will prompt "Allow USB Debugging?" → Allow
4. In Android Studio, select your device from dropdown
5. Click ▶️ Run

### Testing on Emulator:
1. Android Studio → Tools → Device Manager
2. Create Virtual Device → Select a phone (e.g., Pixel 6)
3. Download system image (Android 13/14)
4. Click ▶️ on created device
5. Run app on emulator

---

## 🐛 Debugging

### Web Debugging
```bash
# Start dev server
npm run dev

# Open browser DevTools (F12)
# Console tab: JavaScript errors
# Network tab: API requests
# Application tab: localStorage, Firebase
```

### Android Debugging

#### Logcat (Console Logs)
1. Android Studio → Logcat tab (bottom)
2. Filter by: `Capacitor`
3. See JavaScript console.log() output
4. See native errors

#### Chrome DevTools (for WebView)
1. Phone connected via USB
2. Chrome browser → chrome://inspect
3. Find your app → Click "Inspect"
4. Full DevTools for the WebView

### Common Build Errors

**Error: "JAVA_HOME not set"**
```bash
# Set JAVA_HOME environment variable
export JAVA_HOME=/path/to/jdk-17  # Mac/Linux
set JAVA_HOME=C:\path\to\jdk-17   # Windows
```

**Error: "SDK not found"**
```bash
# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Library/Android/sdk  # Mac
```

**Error: "Gradle sync failed"**
- Close Android Studio
- Delete `/android/.gradle` folder
- Delete `/android/build` folder
- Reopen Android Studio → Sync Gradle

---

## 🔄 Development Workflow

### Making Changes to the App

#### For Web Changes (UI, logic):
1. Edit files in `/src`
2. Save (auto-reloads in browser)
3. Test in browser

#### For Android Changes (needs rebuild):
1. Edit files in `/src`
2. Rebuild:
   ```bash
   VITE_GEMINI_API_KEY="your_key" npm run build
   npx cap sync android
   ```
3. In Android Studio:
   - File → Sync Project with Gradle Files (🐘)
   - Run app

#### For Android Native Changes (rare):
1. Edit Java files in `/android/app/src/main/java`
2. Or edit `AndroidManifest.xml` for permissions
3. In Android Studio:
   - Sync Gradle (🐘)
   - Build → Make Project
   - Run app

---

## 📦 Building Release APK

### Step 1: Build Production Web App
```bash
VITE_GEMINI_API_KEY="your_key" npm run build
npx cap sync android
```

### Step 2: Generate Keystore (First Time Only)
```bash
keytool -genkey -v -keystore dukaan-release.keystore -alias dukaan -keyalg RSA -keysize 2048 -validity 10000
```

Enter password, details. Save the keystore file securely!

### Step 3: Configure Signing in Android Studio
1. Build → Generate Signed Bundle/APK
2. Select APK → Next
3. Choose keystore file
4. Enter passwords
5. Select "release" build variant
6. Finish

Output: `/android/app/release/app-release.apk`

### Step 4: Install APK
```bash
# Transfer APK to phone
adb install app-release.apk

# Or share APK file directly to phone and install
```

---

## 🔑 API Keys & Secrets

### Gemini AI Key
**Location:** `.env` file
```
VITE_GEMINI_API_KEY=your_key_here
```

**Get your own key:**
1. Go to https://aistudio.google.com/apikey
2. Create new API key
3. Replace in `.env`

### Firebase Configuration

**Web Config:** `/src/firebaseConfig.js`
```javascript
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ...
};
```

**Android Config:** `/android/app/google-services.json`

**Get your own:**
1. Firebase Console: https://console.firebase.google.com
2. Create new project
3. Add web app → Copy config → Update `firebaseConfig.js`
4. Add Android app → Download `google-services.json` → Replace in `/android/app/`

---

## 📁 Project Structure Quick Reference

```
Your working directories:
├── /src              ← Edit your React code here
├── /android          ← Only for Android Studio builds
├── /dist             ← Auto-generated, don't edit
├── .env              ← API keys (never commit!)
└── package.json      ← Dependencies

Build commands:
npm run dev           → Web development server
npm run build         → Production build
npx cap sync android  → Update Android app
npx cap open android  → Open in Android Studio
```

---

## ✅ Checklist Before Testing

### Web Testing:
- [ ] `npm install` completed
- [ ] `.env` file created with API key
- [ ] `npm run dev` running
- [ ] Browser shows app at localhost:5000
- [ ] Check console for errors (F12)

### Android Testing:
- [ ] Java 17 installed
- [ ] Android Studio installed
- [ ] JAVA_HOME set
- [ ] ANDROID_HOME set
- [ ] Built with: `VITE_GEMINI_API_KEY="key" npm run build`
- [ ] Synced with: `npx cap sync android`
- [ ] Gradle synced in Android Studio (🐘)
- [ ] Device/emulator connected
- [ ] App runs without crashes

---

## 🆘 Getting Help

### Check Logs:
**Web:** Browser console (F12)
**Android:** Android Studio Logcat

### Common Issues Document:
See `PROJECT_STRUCTURE.md` → "Common Issues" section

### Firebase Issues:
- Check Firebase Console for quotas
- Verify authentication method enabled (Phone)
- Check Firestore rules

### Gemini AI Issues:
- Verify API key is correct
- Check quota at https://aistudio.google.com
- Make sure key is in `.env` AND used in build command

---

## 💡 Tips for Faster Development

1. **Use two terminals:**
   - Terminal 1: `npm run dev` (keep running)
   - Terminal 2: Run build commands when needed

2. **Browser auto-reload:**
   - Edit `/src` files
   - Save → Browser updates automatically

3. **Android instant run:**
   - Small changes: Just hit ▶️ Run again
   - Big changes: Clean + Make + Run

4. **Test on web first:**
   - Faster iteration
   - Better debugging tools
   - Only test Android for native features

5. **Use React DevTools:**
   - Install Chrome extension: React Developer Tools
   - Inspect component state/props

---

**You're now ready for local development! Start with `npm run dev` and go from there.**
