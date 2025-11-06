# DUKAAN - Quick Commerce Application (ఘుకాన్)

## Overview
Dukaan is a modern quick commerce application inspired by Zepto, providing a seamless direct-to-consumer shopping experience for groceries, medicines, and electronics. Built with React, Vite, and Firebase, it features a three-level category hierarchy, comprehensive order management with flexible workflows (pickup/delivery), and bilingual support (English/Telugu). The application aims to deliver a production-ready, scalable solution with a professional and intuitive user experience. Key capabilities include robust authentication, streamlined checkout, dynamic order type changes, image upload capabilities, consistent price calculation, a comprehensive rider management system, voice shopping with Gemini AI, and customizable branding.

## User Preferences
I prefer the agent to be meticulous and thorough, avoiding the introduction of new bugs or regressions. When making changes, prioritize robust, production-quality code. For any significant architectural decisions or feature implementations, please ask for confirmation before proceeding. Ensure that the design philosophy adheres to a professional, emoji-free aesthetic with real product imagery. I value clear and concise explanations for complex technical concepts. Do not make changes to the `App.jsx` file without explicit instruction.

## System Architecture

### UI/UX Decisions
The application features a modern, mobile-first design with a professional, emoji-free aesthetic and real product images. It includes a green gradient header, language toggle, modern search bar, and bottom navigation. Color-coded status badges and professional card layouts are used. The UI supports bilingual display (English/Telugu) and focuses on a village-friendly login system and intuitive checkout.

### Technical Implementations
- **Frontend**: React with Vite.
- **Backend/Database**: Firebase (Firestore, Authentication).
- **Styling**: Custom CSS with `lucide-react` for icons.
- **Bilingual Support**: Comprehensive translation dictionary and language toggle.
- **Image Handling**: Supports direct image upload (Base64) and URL-based images.
- **Search**: Production-ready product search functionality.
- **State Management**: React's Context API (AuthContext, DataContext, CartContext, AddressContext).
- **Code Structure**: Feature-oriented component-based architecture for maintainability and scalability.

### Feature Specifications
- **Authentication & Role-Based Access Control**:
    - Village-friendly registration (name-only, password/email optional).
    - OTP-first login with intelligent user detection.
    - **Authentication Flow** (Fixed Nov 3, 2025; Updated Nov 6, 2025):
        - `checkUserExists` verifies if user has password field before asking for password.
        - OTP-only users (no password) bypass password screen and use OTP directly.
        - `handleVerifyOTP` branches on `isNewUser` flag: new users → registration, existing users → login.
        - Duplicate phone number prevention in `handleSaveProfile` checks UID before creating profile.
        - "Use OTP Instead" button on password screen for recovery.
        - **Fixed**: ProfileSetupModal now only appears for truly new users, not returning users (Nov 6, 2025).
    - **Profile Setup Flexibility** (Nov 6, 2025):
        - "Skip for Now" button allows users to bypass initial profile setup.
        - Auto-generated usernames (`User1`, `User2`, etc.) for skipped profiles.
        - `profileCompleted` field tracks setup status.
        - Profile completion enforced before checkout - users must complete profile to place orders.
        - Users can complete profile anytime from Profile tab.
    - Role-based system: `customer` by default, `shopkeeper`/`rider` assigned in Firebase Console.
    - Auto-redirect on login: shopkeepers → `?mode=shopkeeper`, riders → `?mode=rider`, customers → default app.
    - Strict role isolation for customer, shopkeeper, and rider interfaces.
    - Mode switching removed from dashboards; only accessible via customer profile for authorized roles.
    - Separate authentication for riders (`RiderContext`).
    - **Known Security Issue**: Passwords stored in plaintext in Firestore (requires hashing implementation).
- **Address Management**: CRUD operations, labels, default selection, delivery instructions.
- **Three-Level Category Hierarchy**: Home → Subcategories → Products.
- **Triple Interface Architecture**: Separate customer app, shopkeeper dashboard (`?mode=shopkeeper`), and rider dashboard (`?mode=rider`).
- **Comprehensive Order Management**:
    - Simplified 4-status workflow: Pending → Accepted → (Ready for Pickup / Out for Delivery) → (Completed / Delivered).
    - Customer ability to change delivery method for pending/accepted orders.
    - Shopkeeper dashboard with order tabs, product details, and status updates.
    - Order cancellation.
- **Product Management**: CRUD for products, categories, subcategories (shopkeeper dashboard), including "out of stock" and "popular" toggles, and dual image input.
- **Comprehensive Rider Management System**:
    - Separate rider authentication and dashboard.
    - Secure access to assigned orders only (Ready to Pickup, Out for Delivery, Delivered).
    - Google Maps integration for navigation.
    - One-tap status updates and automatic rider assignment.
    - Shopkeeper dashboard for rider performance metrics and assignment.
    - Customer visibility of assigned rider's contact information.
- **Enhanced Order Type Modal**: Professional UI for changing delivery method with address display and improved styling.
- **Price Calculation Consistency**: Uses discounted prices consistently across all views.
- **Voice Shopping with Gemini AI**:
    - Integrated Google Gemini 2.0 Flash for AI-powered shopping.
    - Voice search in header search bar (mic button) supporting multiple languages (Telugu/English/Hindi/Hinglish).
    - Semantic product search with AI understanding synonyms and local languages.
    - Shopkeeper voice-to-text input for forms with language-aware recognition.
- **User Profile**: Order history, user statistics, admin panel access.
- **Real-time Notifications**: Toast notifications for order status.
- **Customizable Branding**: Logo upload capability in Shopkeeper Dashboard Settings, displaying across all interfaces. Custom favicon.
- **Flexible Item Ordering**: Shopkeeper-controlled ordering of categories, subcategories, and products via up/down arrows, stored in `sortOrder` field in Firestore.

### System Design Choices
- **Authentication**: Hybrid (OTP for verification, password for convenience).
- **Data Structure**: Firestore collections for `products`, `orders`, `categories`, `subcategories`, and `users`.
- **Scalability**: Stateless web application design.
- **Idempotent Seed Data**: Prevents duplicate data entry.

## External Dependencies
- **Firebase**: Firestore (database), Authentication (phone and anonymous sign-in).
- **Google Gemini AI**: Used for voice-powered shopping, semantic search, and language translation (`@google/genai` package).
- **Web Speech API**: Browser-native speech recognition.
- **lucide-react**: For vector icons.

## Recent Updates (Nov 6, 2025)

### UI/UX Improvements
- **Modern Header Redesign**: Complete UI overhaul to sleek, modern design:
  - Clean white background (removed green gradient)
  - Logo displayed with language-conditional brand name (shows "DUKAAN" in English OR "దుకాణ్" in Telugu, not both)
  - Removed location display (users select delivery address during checkout)
  - Gray search bar background for modern aesthetic
  - Language toggle always displays "తెలుగు/EN" for clarity
  - Lightweight shadow for subtle depth
  - Local logo file (/dukaan-logo.png) as fallback when no custom Firebase logo uploaded
- **Fixed Cart Footer**: Checkout footer now stays fixed at bottom of screen with z-index:101 and safe-area-inset support for better UX on all devices. Users don't need to scroll to find checkout button.
- **ProfileSetupModal Mobile Enhancement**: Wider modal (90% screen width, max 500px), larger input fields (16px font, 14-16px padding), improved spacing and readability for mobile users.
- **Profile Loading Enhancement**: Added comprehensive logging to track profile loading issues and ensure userProfile state updates correctly after authentication.
- **Loading Screen Enhancement**: Beautiful gradient loading screen displaying custom logo (if uploaded) or DUKAAN branding with pulsing animation.
- **Bilingual Support**: Strict Telugu/English only language toggle - no additional languages.
- **Mobile-First Modal/Popup Optimization** (Nov 6, 2025):
  - All modals now have 16px spacing from screen edges on mobile (prevents edge-touching issue)
  - Base modal CSS updated: `width: calc(100% - 32px)` provides consistent side margins
  - Mobile-specific padding optimization (@media max-width: 500px):
    - Modal header/body/footer: 16px (reduced from 20px for better screen utilization)
    - Checkout sections: 16px internal padding
    - Modal titles: 18px font size (down from 20px)
  - ProfileSetupModal converted from inline styles to CSS classes with responsive adjustments:
    - Desktop: 28px/24px padding (original design preserved)
    - Mobile: 20px/16px padding (optimized for small screens)
  - **Login Page Mobile Fix**: Login container width changed to `calc(100% - 32px)` for proper 16px side margins on mobile devices
  - All modals verified: CheckoutConfirmationModal, ChangeOrderTypeModal, OrderDetailsModal, AddressForm
  - Toast notifications already optimized at 90% width
  - Android build updated with all modal improvements
- **Analytics Revenue Fix** (Nov 6, 2025):
  - Daily revenue calculation now only counts Completed and Delivered orders
  - Excludes pending, accepted, and cancelled orders from revenue totals
  - Provides accurate financial reporting for shopkeepers

### Geolocation & Navigation Features
- **Address Geolocation**: "Use My Location" button in AddressForm with browser geolocation API (high-accuracy mode).
- **Reverse Geocoding**: OpenStreetMap Nominatim integration to convert GPS coordinates to human-readable addresses.
- **Coordinates Storage**: Latitude/longitude saved with addresses in Firestore (`latitude`, `longitude` fields).
- **Rider Navigation**: Orders include `deliveryLatitude` and `deliveryLongitude` fields for GPS-based rider navigation to delivery addresses.
- **Error Handling**: Graceful fallbacks for permission denials, timeout errors, and unsupported devices.
- **Coordinate Display**: Visual feedback showing captured coordinates in address form after successful geolocation.

## Android-Specific Configuration

### Firebase Phone Authentication Fix (Nov 3, 2025)
- **Issue**: reCAPTCHA fails in Android WebView, causing `auth/operation-not-allowed` errors.
- **Solution**: 
  - `MainActivity.java`: Configured WebView to enable third-party cookies, mixed content, DOM storage, and database support.
  - `AndroidManifest.xml`: Added `usesCleartextTraffic="true"` for reCAPTCHA compatibility.
- **Requirements**: Phone + Email/Password authentication must be enabled in Firebase Console.
- **Testing**: Use Firebase test phone numbers to bypass SMS charges during development.
- **Documentation**: See `ANDROID_FIREBASE_FIX.md` for complete guide.