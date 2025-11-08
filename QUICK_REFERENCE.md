# Quick Reference - Common Commands

## 🚀 Local Development

### Web Development
```bash
# Start dev server
npm run dev

# Access at:
http://localhost:5000
```

### Build for Android
```bash
# 1. Build (MUST use inline env var!)
VITE_GEMINI_API_KEY="AIzaSyAVBBw2bRGN8JUjZZyfjYIScdpwv6pGx9c" npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. In Android Studio:
#    - Click 🐘 Sync Gradle
#    - Build → Clean Project
#    - Build → Make Project
#    - Click ▶️ Run
```

---

## 📂 Where to Edit Code

```
/src/features/auth/          → Login, authentication
/src/features/products/      → Product display, search
/src/features/cart/          → Shopping cart
/src/features/orders/        → Order management
/src/features/shopkeeper/    → Shopkeeper dashboard
/src/features/rider/         → Rider dashboard

/src/services/gemini.js      → AI features (voice, search)
/src/utils/audioRecorder.js  → Microphone recording
/src/translations/           → English/Telugu text
/src/firebaseConfig.js       → Firebase web config
```

---

## 🐛 Debugging

### Web
```bash
# Browser console
F12 → Console tab

# Check network requests
F12 → Network tab

# React DevTools
Install: React Developer Tools (Chrome extension)
```

### Android
```bash
# Logcat in Android Studio
Filter by: Capacitor

# Chrome DevTools for WebView
chrome://inspect → Your app → Inspect
```

---

## 🔧 Common Fixes

### "API key missing" in Android
```bash
# Use inline env var during build
VITE_GEMINI_API_KEY="your_key" npm run build
npx cap sync android
```

### "VoiceRecorder not implemented"
```bash
# Sync Gradle in Android Studio
Click 🐘 elephant icon
```

### Changes not showing in Android
```bash
# Clean rebuild
rm -rf dist
VITE_GEMINI_API_KEY="your_key" npm run build
npx cap sync android
# Then in Android Studio: Clean + Make + Run
```

### Blank screen in Android
```bash
# Check if build synced
ls -la android/app/src/main/assets/public/assets/

# If empty or old, rebuild:
npm run build
npx cap sync android
```

---

## 📦 File Locations

### API Keys
```
.env                          → Gemini API key (web)
src/firebaseConfig.js         → Firebase web config
android/app/google-services.json → Firebase Android config
```

### Build Output
```
/dist                         → Production build (auto-generated)
/android/app/src/main/assets/public/ → Android app files
```

### Android APK
```
/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Testing Shortcuts

### Test on Web
```bash
npm run dev
# Edit /src files → auto-reload
```

### Test on Android
```bash
# After code changes:
VITE_GEMINI_API_KEY="key" npm run build && npx cap sync android
# In Android Studio: Click ▶️ Run
```

### Test on Physical Phone
```bash
# Enable USB debugging on phone:
Settings → About → Tap "Build Number" 7 times
Settings → Developer Options → USB Debugging → ON

# Connect USB → Android Studio → Select device → Run
```

---

## 🎯 The Build Flow

```
1. Edit /src files (your React code)
2. npm run build → Creates /dist
3. npx cap sync android → Copies /dist to /android
4. Android Studio builds → Creates APK
```

**Remember:** Android doesn't see your `/src` changes until you rebuild + sync!

---

## 🔑 Critical Commands

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build for production
VITE_GEMINI_API_KEY="key" npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android
```

---

## 📚 Full Documentation

- **`PROJECT_STRUCTURE.md`** - Complete project architecture
- **`LOCAL_DEVELOPMENT.md`** - Step-by-step local setup
- **`replit.md`** - Project overview & technical specs

---

**Need help? Check the full documentation files above!**
