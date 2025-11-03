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
    - OTP-first login.
    - Role-based system: `customer` by default, `shopkeeper`/`rider` assigned in Firebase Console.
    - Strict role isolation for customer, shopkeeper, and rider interfaces.
    - Separate authentication for riders (`RiderContext`).
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