# Dukan - Quick Commerce Application (దుకాణ్)

## Overview
Dukan is a modern quick commerce application built with React, Vite, and Firebase, inspired by Zepto. It provides a seamless direct-to-consumer shopping experience for various products like groceries, medicines, and electronics. The application features a three-level category hierarchy, comprehensive order management, and bilingual support (English/Telugu), targeting a professional and intuitive user experience akin to leading e-commerce platforms. The project aims to deliver a production-ready, scalable solution for quick commerce.

## User Preferences
I prefer the agent to be meticulous and thorough, avoiding the introduction of new bugs or regressions. When making changes, prioritize robust, production-quality code. For any significant architectural decisions or feature implementations, please ask for confirmation before proceeding. Ensure that the design philosophy adheres to a professional, emoji-free aesthetic with real product imagery. I value clear and concise explanations for complex technical concepts. Do not make changes to the `App.jsx` file without explicit instruction.

## System Architecture

### UI/UX Decisions
The application features a modern, mobile-first design with a professional, emoji-free aesthetic. It uses real product images (from Unsplash or placeholder.com) for categories and subcategories, mimicking Zepto/Amazon standards. Key UI elements include a green gradient header, language toggle, modern search bar, and a bottom navigation with Home, Orders, Cart, and Profile. Color-coded status badges and professional card layouts are used for orders and product displays. The UI supports bilingual display (English/Telugu) throughout.

### Technical Implementations
- **Frontend**: React 19.1.1 with Vite 7.1.7 for fast development and build times.
- **Backend/Database**: Firebase (Firestore for data storage, Authentication for anonymous sign-in).
- **Styling**: Custom CSS with CSS variables and `lucide-react` for icons.
- **Bilingual Support**: Implemented with a comprehensive translation dictionary and a language toggle hook.
- **Image Handling**: Supports direct image upload (Base64 conversion up to 500KB) and URL-based images.
- **Search**: Production-ready search functionality that accurately filters products by name.
- **State Management**: React's built-in state management and context API for sharing data.

### Feature Specifications
- **Three-Level Category Hierarchy**: Home (main categories) -> Subcategories -> Products, with back navigation.
- **Dual Interface Architecture**: Separated customer app (default) and shopkeeper dashboard (`?mode=shopkeeper`) for distinct user roles.
- **Comprehensive Order Management**: Includes order placement, real-time status tracking (Pending, Processing, Delivered), professional order display with product images, and a dedicated order history.
- **Product Management**: Full CRUD operations for products, categories, and subcategories (shopkeeper dashboard). Products can be marked as popular.
- **User Profile**: Enhanced section with order history, user statistics, and admin panel access.
- **Real-time Notifications**: Toast notifications for order status updates.

### System Design Choices
- **Anonymous Authentication**: Provides instant access for consumers without requiring account setup.
- **Data Structure**: Firestore collections for `products`, `orders`, `categories`, and `subcategories`. Products store `category` and `subcategoryId` for efficient filtering.
- **Scalability**: Designed as a stateless web application for easy autoscale deployment.
- **Idempotent Seed Data**: Prevents duplicate data entry in Firebase.

## External Dependencies
- **Firebase**: Utilized for Firestore (database), Authentication (anonymous sign-in), and potentially Firebase Storage for image hosting (though current implementation uses Base64 or placeholder URLs).
- **Unsplash**: Used as a source for real product images for categories and subcategories.
- **placeholder.com**: Used for fallback images when specific product images are unavailable.
- **lucide-react**: For vector icons used throughout the application.