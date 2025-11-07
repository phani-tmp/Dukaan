# DUKAAN - Quick Commerce Application

## Overview
Dukaan is a quick commerce application, inspired by Zepto, designed for direct-to-consumer shopping across groceries, medicines, and electronics. Built with React, Vite, and Firebase, it offers a scalable, production-ready solution with a professional and intuitive user experience. Key features include robust authentication with OTP-first login, a three-level category hierarchy, comprehensive order management with flexible workflows (pickup/delivery), bilingual support (English/Telugu), AI-powered voice and text shopping via Google Gemini, and customizable branding. The project aims to provide a seamless shopping experience and efficient management tools for shopkeepers and riders.

## User Preferences
I prefer the agent to be meticulous and thorough, avoiding the introduction of new bugs or regressions. When making changes, prioritize robust, production-quality code. For any significant architectural decisions or feature implementations, please ask for confirmation before proceeding. Ensure that the design philosophy adheres to a professional, emoji-free aesthetic with real product imagery. I value clear and concise explanations for complex technical concepts. Do not make changes to the `App.jsx` file without explicit instruction.

## System Architecture

### UI/UX Decisions
The application features a modern, mobile-first design with a professional, emoji-free aesthetic and real product images. It includes a redesigned header, language toggle, modern search bar, and bottom navigation. Color-coded status badges and professional card layouts are used. The UI supports bilingual display (English/Telugu) and focuses on a village-friendly login system and intuitive checkout process. Modals and popups are optimized for mobile with consistent spacing and responsive adjustments.

### Technical Implementations
- **Frontend**: React with Vite.
- **Backend/Database**: Firebase (Firestore, Authentication).
- **Styling**: Custom CSS with `lucide-react` for icons.
- **Comprehensive Bilingual Support**: Translation dictionary for all UI text, bilingual product/category/subcategory names (`nameEn`, `nameTe`), and language toggle. All hardcoded English text replaced with translation keys for complete Telugu support.
- **Image Handling**: Supports direct image upload (Base64) and URL-based images.
- **Search**: Production-ready product search functionality, enhanced with AI semantic search.
- **State Management**: React's Context API (AuthContext, DataContext, CartContext, AddressContext).
- **Code Structure**: Feature-oriented component-based architecture.
- **Geolocation**: Browser geolocation API with OpenStreetMap Nominatim for reverse geocoding.

### Feature Specifications
- **Authentication & Role-Based Access Control**: Village-friendly OTP-first login with intelligent user detection, profile setup flexibility (skip option), and distinct roles (customer, shopkeeper, rider) with strict isolation.
- **Address Management**: CRUD operations, labels, default selection, delivery instructions, and storage of geographical coordinates.
- **Three-Level Category Hierarchy**: Home → Subcategories → Products. All levels support bilingual names (English and Telugu).
- **Bilingual Product Names**: Products, categories, and subcategories all have `nameEn` and `nameTe` fields. UI automatically displays the appropriate language based on user selection, with backward compatibility for legacy products with single `name` field.
- **Triple Interface Architecture**: Separate customer app, shopkeeper dashboard, and rider dashboard.
- **Comprehensive Order Management**: Simplified 4-status workflow (Pending → Accepted → (Ready for Pickup / Out for Delivery) → (Completed / Delivered)), customer-initiated delivery method changes, and order cancellation. Orders store customer language preference for proper receipt printing.
- **Shopkeeper Order Display**: Collapsible product list with bilingual names (English and Telugu) for efficient order preparation. Space-saving dropdown shows item count when collapsed, full product details when expanded.
- **Product Management**: CRUD for products, categories, subcategories (shopkeeper dashboard), including "out of stock" and "popular" toggles, and dual image input. Flexible item ordering via sortable fields.
- **Comprehensive Rider Management System**: Separate rider authentication and dashboard, secure access to assigned orders, Google Maps integration for navigation, one-tap status updates, and automatic rider assignment.
- **AI-Powered Shopping with Gemini**: Voice search (MediaRecorder API + Gemini 2.0 Flash audio transcription) and debounced semantic text search supporting multilingual input (Telugu, English, Hindi) and contextual understanding. Includes shopkeeper voice-to-text input for forms.
- **User Profile**: Order history, user statistics.
- **Real-time Notifications**: Toast notifications for order status.
- **Customizable Branding**: Logo upload for display across all interfaces.

### System Design Choices
- **Authentication**: Hybrid (OTP for verification, password for convenience).
- **Data Structure**: Firestore collections for `products`, `orders`, `categories`, `subcategories`, and `users`.
- **Scalability**: Stateless web application design.
- **Idempotent Seed Data**: Prevents duplicate data entry.

## External Dependencies
- **Firebase**: Firestore (database), Authentication (phone and anonymous sign-in).
- **Google Gemini AI**: Used for voice-powered shopping (audio transcription), semantic search, and language translation (`@google/genai` package).
- **Browser MediaRecorder API**: Audio recording for voice input.
- **lucide-react**: For vector icons.
- **OpenStreetMap Nominatim**: For reverse geocoding addresses.