# Dukan - Quick Commerce Application (దుకాణ్)

## Overview
Dukan is a modern quick commerce application built with React, Vite, and Firebase, inspired by Zepto. It provides a seamless direct-to-consumer shopping experience for various products like groceries, medicines, and electronics. The application features a three-level category hierarchy, comprehensive order management, and bilingual support (English/Telugu), targeting a professional and intuitive user experience akin to leading e-commerce platforms. The project aims to deliver a production-ready, scalable solution for quick commerce.

## Recent Changes (October 25, 2025)

### Phase 1: Phone Authentication & Address Management (October 25, 2025 - LATEST)
- **PHONE AUTHENTICATION WITH OTP**: Professional login system replacing anonymous auth
  - Firebase phone authentication with reCAPTCHA verification
  - Country code selection (+91 India as default)
  - 6-digit OTP input with beautiful gradient design
  - Automatic first-time user detection and profile setup
  - Secure logout functionality with state cleanup
  
- **USER PROFILE MANAGEMENT**: Complete customer information system
  - Firestore-backed users collection for data persistence
  - Name, email, and phone number storage
  - Profile setup modal for first-time users
  - Integrated with checkout flow (phone required for orders)
  - Profile display in Profile tab
  
- **ADDRESS MANAGEMENT SYSTEM**: Amazon-style saved addresses
  - Full CRUD operations: add, edit, delete addresses
  - Address labels: Home, Work, Other with color-coded badges
  - Default address selection for quick checkout
  - Delivery instructions field for each address
  - Addresses collection in Firestore with real-time sync
  - Beautiful modal-based UI with AddressManager, AddressForm components
  
- **CHECKOUT INTEGRATION**: Seamless order placement with saved data
  - Automatic validation: profile and address required before checkout
  - Uses default address (or first address) for delivery
  - Order data includes full address and customer phone
  - Smooth UX flow: Profile → Addresses → Cart → Checkout
  
- **PROFESSIONAL UI/UX**: 400+ lines of polished CSS
  - Login screen with green gradient background
  - Modal overlays for profile and address management
  - Color-coded address labels and default badges
  - Hover effects and smooth transitions
  - Mobile-first responsive design
  - Click-to-call phone links for shopkeepers

### Production-Ready Order Workflow System (Updated October 25, 2025)
- **SIMPLIFIED ORDER WORKFLOW**: Clear 4-status progression
  - **New Workflow**: Pending → Accepted → Out for Delivery → Delivered (+ Cancelled option)
  - **Removed Confusing Statuses**: "Ready" and "Completed" eliminated for clarity
  - Status dropdown with only essential options
  - Dropdown auto-disables once order is Delivered or Cancelled
  
- **CUSTOMER CONTACT & DELIVERY**: Full address management system
  - Phone number required at checkout (clickable tel: links for shopkeepers)
  - Delivery address + optional delivery instructions
  - All contact info visible in shopkeeper dashboard
  - Order cancellation with reason tracking

- **SHOPKEEPER ORDER ORGANIZATION**: Professional tabs for better order management
  - **Active Orders Tab**: Shows Pending, Accepted, Out for Delivery orders
  - **Completed Orders Tab**: Shows Delivered and Cancelled orders
  - Real-time order counts displayed in tab labels
  - Clean separation between ongoing and finished orders
  
- **ENHANCED SHOPKEEPER ORDER DISPLAY**: Professional order cards like Zepto
  - Product images (50x50px) for all order items
  - Quantity badges (× quantity) displayed clearly
  - Customer phone with click-to-call functionality
  - Full delivery address visible in order cards
  - Professional status dropdown for order management
  - View Details and Cancel Order buttons (auto-hidden for completed orders)
  
- **ORDER CANCELLATION TRANSPARENCY**: Customer sees why orders were cancelled
  - Cancellation reason visible in customer Orders tab
  - Beautiful red-gradient card highlights cancellation
  - Clear messaging with icon and label
  - Complete transparency between shopkeeper and customer
  
- **ORDER DETAILS MODAL**: Comprehensive order information view
  - Order ID, date/time, status badge
  - Customer phone with click-to-call
  - Full delivery address + instructions in highlighted card
  - All items with images, quantities, and prices
  - Order total prominently displayed
  - Professional modal design with overlay
  
- **INVENTORY MANAGEMENT**: Out of stock functionality
  - Toggle in shopkeeper dashboard to mark products out of stock
  - Out-of-stock products cannot be added to cart (button disabled)
  - Visual indicators: dimmed appearance + red "OUT OF STOCK" badge
  - Perfect for both pickup and delivery scenarios
  - Prevents customer orders for unavailable items

- **UI/UX ENHANCEMENTS**: Production-ready design improvements
  - 450+ lines of new CSS for order management features
  - Hover effects and smooth transitions throughout
  - Color-coded status badges for quick order identification
  - Professional modal overlay design
  - Fully responsive and mobile-friendly

### Image-Based Design (Previous Update)
- Removed ALL emojis - using real product images only
- Fixed navigation for categories without subcategories
- Search precision: only matches product names
- Logo support in app header
- Professional, modern look matching Zepto/Amazon standards

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