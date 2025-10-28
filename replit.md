# DUKAAN - Quick Commerce Application (ఘుకాన్)

## Overview
Dukaan is a modern quick commerce application built with React, Vite, and Firebase, inspired by Zepto. It provides a seamless direct-to-consumer shopping experience for various products like groceries, medicines, and electronics. The application features a three-level category hierarchy, comprehensive order management with flexible workflows (pickup vs. delivery), and bilingual support (English/Telugu). It aims to deliver a production-ready, scalable solution for quick commerce with a professional and intuitive user experience. Recent enhancements include a robust password-based authentication system, a streamlined checkout process with a confirmation modal, and the ability for customers to change order types post-placement.

## User Preferences
I prefer the agent to be meticulous and thorough, avoiding the introduction of new bugs or regressions. When making changes, prioritize robust, production-quality code. For any significant architectural decisions or feature implementations, please ask for confirmation before proceeding. Ensure that the design philosophy adheres to a professional, emoji-free aesthetic with real product imagery. I value clear and concise explanations for complex technical concepts. Do not make changes to the `App.jsx` file without explicit instruction.

## System Architecture

### UI/UX Decisions
The application features a modern, mobile-first design with a professional, emoji-free aesthetic, utilizing real product images. It includes a green gradient header, language toggle, modern search bar, and bottom navigation (Home, Orders, Cart, Profile). Color-coded status badges and professional card layouts are used for orders and product displays. The UI supports bilingual display (English/Telugu) throughout. A key focus is on a village-friendly login system and a clear, intuitive checkout flow.

### Technical Implementations
- **Frontend**: React 19.1.1 with Vite 7.1.7.
- **Backend/Database**: Firebase (Firestore for data storage, Authentication for phone and anonymous sign-in).
- **Styling**: Custom CSS with CSS variables and `lucide-react` for icons.
- **Bilingual Support**: Comprehensive translation dictionary and language toggle.
- **Image Handling**: Supports direct image upload (Base64) and URL-based images.
- **Search**: Production-ready search functionality filtering products by name.
- **State Management**: React's Context API for centralized state (AuthContext, DataContext, CartContext, AddressContext).
- **Code Structure**: Feature-oriented component-based architecture for maintainability and scalability, separating concerns into `components/shared`, `features/customer`, `features/auth`, `features/address`, `features/shopkeeper`, `features/admin`, `contexts`, `services`, `constants`, and `utils`.

### Feature Specifications
- **Authentication**: Phone authentication with OTP for new users and password-based login for returning users, integrated with reCAPTCHA. Includes user profile management (name, email, phone).
- **Address Management**: CRUD operations for addresses with labels (Home, Work, Other), default address selection, and delivery instructions.
- **Three-Level Category Hierarchy**: Home (main categories) -> Subcategories -> Products, with back navigation.
- **Dual Interface Architecture**: Separated customer app and shopkeeper dashboard (`?mode=shopkeeper`).
- **Comprehensive Order Management**:
    - Simplified 4-status workflow: Pending → Accepted → (Ready for Pickup / Out for Delivery) → (Completed / Delivered).
    - Customer ability to change delivery method for pending/accepted orders.
    - Shopkeeper dashboard with active/completed order tabs, product images, quantity badges, customer contact info, and status dropdowns.
    - Order cancellation with reason tracking.
    - Detailed order view modal.
- **Product Management**: CRUD for products, categories, subcategories (shopkeeper dashboard), including "out of stock" toggling and "popular" marking.
- **User Profile**: Enhanced section with order history, user statistics, and admin panel access.
- **Real-time Notifications**: Toast notifications for order status updates.

### System Design Choices
- **Authentication**: Hybrid authentication (OTP for verification, password for convenience) for a village-friendly approach.
- **Data Structure**: Firestore collections for `products`, `orders`, `categories`, `subcategories`, and `users`. Products link to categories and subcategories.
- **Scalability**: Designed as a stateless web application.
- **Idempotent Seed Data**: Prevents duplicate data entry in Firebase.

## External Dependencies
- **Firebase**: Utilized for Firestore (database), Authentication (phone and anonymous sign-in), and potentially Firebase Storage for image hosting.
- **Unsplash**: Source for real product images.
- **placeholder.com**: Used for fallback images.
- **lucide-react**: For vector icons.