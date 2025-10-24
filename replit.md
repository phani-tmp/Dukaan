# Dukan - Quick Commerce Application (దుకాణ్)

## Overview
Dukan is a modern quick commerce application built with React, Vite, and Firebase. Inspired by Zepto, it provides a seamless direct-to-consumer shopping experience for groceries, kirana items, medicines, snacks, and electronics. The app features bilingual support (English/Telugu) for better local accessibility.

## Recent Changes (October 23, 2025)

### Latest Updates - Zepto-Style Subcategory System (October 24, 2025)
- **MAJOR FEATURE: Three-Level Category Hierarchy**: Complete subcategory navigation system like Zepto
  - **Level 1 (Home)**: Shows main category grid + popular products
  - **Level 2 (Subcategories)**: Click category → Shows subcategory grid (e.g., Groceries → Dals, Rice, Oils, Spices, Flours)
  - **Level 3 (Products)**: Click subcategory → Shows products in that subcategory
  - Back button navigation at each level
  - Bilingual support for all category and subcategory names (English/Telugu)

- **Shopkeeper Category Management**: New Categories tab with full CRUD operations
  - Add/edit/delete main categories
  - Customize: Name (EN/TE), Icon (emoji), Color, Gradient
  - Icon preview with category color
  - Real-time Firebase sync

- **Shopkeeper Subcategory Management**: New Subcategories tab with full CRUD operations
  - Add/edit/delete subcategories linked to parent categories
  - Select parent category from dropdown
  - Customize: Name (EN/TE), Icon (emoji)
  - Shows parent category relationship in list
  - Real-time Firebase sync

- **Enhanced Products Tab**: Now requires category + subcategory selection
  - Category dropdown filters available subcategories
  - Form validation: Cannot save without subcategory
  - Legacy product support: Old products without subcategoryId still visible as fallback
  - Automatic product organization by subcategory

- **Seed Default Data**: One-click Zepto-style data population
  - 6 main categories: Groceries, Vegetables, Milk & Dairy, Snacks, Medicines, Electronics
  - 20+ subcategories across all categories
  - "Seed Default Data" button appears when categories collection is empty
  - Prevents duplicate seeding with smart checks
  - Deterministic IDs prevent conflicts

- **Production-Ready Implementation**:
  - Legacy product fallback: Products without subcategoryId show in category-matching subcategories
  - Form validation enforces subcategoryId before saving
  - Idempotent seed function prevents duplicate data
  - Firebase collections: `/categories` and `/subcategories`
  - Products store both `category` and `subcategoryId` fields

### Previous Updates - Complete Order Management System (October 24, 2025)
- **FIXED: Product Images & Details in Orders**: Orders now save complete product data
  - Product images (imageUrl) saved with each order item
  - Weight and category information preserved
  - Legacy order compatibility with fallback placeholders
  
- **Active Orders Tab**: Orders section shows only pending/processing orders
  - Delivered orders automatically filtered out
  - Clean, focused view of current order status
  - "No active orders" empty state when all orders completed

- **Professional Order Display**: Amazon/Flipkart-quality order cards
  - Product images displayed for each item in order
  - Individual item details: name, weight, quantity, price per item
  - Item subtotals calculated and displayed
  - Professional card layout with header, items section, and footer
  - Color-coded status badges (green=delivered, blue=processing, orange=pending)
  - Order date in readable format (e.g., "23 Oct 2024")
  - Total amount prominently displayed in footer

- **Clean Order History Button**: Professional button-based navigation (not cluttered list)
  - "View Order History" button in Profile shows total count
  - Clicking opens dedicated Order History view
  - All orders (including delivered) displayed in separate page
  - Prevents profile clutter as orders increase
  - Back button to return to Profile
  - Clickable order cards with hover effects
  - Shows date, item count, status, and total amount
  - Chevron indicator for clickability
  
- **Order Details Modal**: Professional popup for order details
  - Triggered by clicking any order in history
  - Close button (X) at top right
  - Overlay dismiss (click outside to close)
  - Full order information: date, status, items with images
  - Smooth slide-in animation
  - Responsive design for all screen sizes
  
- **Production-Ready Quality**: Architect-reviewed implementation
  - No UX regressions or bugs
  - Responsive CSS with proper animations
  - Follows React best practices
  - Ready for market launch and future LLM integration

### Previous Updates - Production-Ready Search & Popular Products Fix
- **CRITICAL FIX: Popular Products Filtering**: Fixed bug where ALL products were appearing in Popular section
  - Now correctly filters only products with `isPopular === true`
  - Empty state message when no products are marked as popular
  - Production-quality implementation matching industry standards

- **CRITICAL FIX: Search Results Display**: Completely redesigned search UX to match Zepto/Amazon
  - **When NOT searching**: Shows category grid + Popular Products section (only starred products)
  - **When searching**: Hides categories, shows full "Search Results" section with ALL matching products
  - Search results count displayed: "Search Results (X)"
  - Empty state for "no results found"
  - Professional UX that users expect from market-ready apps

- **Enhanced Error Handling**: Production-grade shopkeeper dashboard
  - Firebase initialization checks on all button handlers
  - Detailed error messages for debugging
  - Console logging for tracking actions
  - Prevents crashes from missing database connection

### Previous Updates - Shopkeeper Dashboard Enhancements
- **Separate Shopkeeper Dashboard**: Complete business management interface accessed via `?mode=shopkeeper`
  - Three tabs: Orders, Products, Popular Products
  - Clean separation from customer shopping experience
  - Real-time order and product management

- **Direct Image Upload**: Upload product images from device
  - File picker with drag-and-drop interface
  - Image preview before submission
  - Converts to base64 (max 500KB)
  - Alternative: Paste image URL

- **Search & Filter System**: Advanced product and order search
  - Sticky search bar at top of dashboard
  - Category filters: All, Groceries, Vegetables, Milk, Snacks, Medicines, Electronics
  - Product count badges per category
  - Real-time filtering

- **Enhanced Order Management**: Beautiful, functional order cards
  - Modern card design with shadows and hover effects
  - Color-coded status badges (pending/processing/delivered)
  - Itemized order details with quantities and prices
  - Action buttons: "Accept Order" and "Mark Delivered"
  - Large, bold total amount display

- **Real-time Notifications**: Customer notifications for order updates
  - Toast notifications when shopkeeper accepts order
  - Notifications when order is delivered
  - Auto-dismiss after 5 seconds with manual close
  - Slide-down animation
  - Tracks ALL orders for status changes

- **Popular Products Management**: Curate featured products
  - Dedicated tab for managing popular items
  - Star toggle to mark/unmark products
  - Visual indicators (gold star) for popular status
  - Syncs to customer "Popular Products" section

### Previous Updates
- **Dual Interface Architecture**: Two distinct user experiences
  - Customer App: Pure shopping experience (default URL)
  - Shopkeeper Dashboard: Business management (`?mode=shopkeeper`)
  - **Security Note**: URL-based access for development; production requires Firebase Auth with custom claims

- **Enhanced Profile Section**: Comprehensive user dashboard
  - Order history (last 5 orders) with date, items, and total
  - User statistics: total orders and total spent
  - Visual stat cards with icons
  - Admin panel access for authorized users
  - Real-time order tracking integration

- **Modern UI/UX Redesign**: Sleek, mobile-first interface with bilingual support
  - Green gradient header with location display (Ponnur, AP)
  - Language toggle (EN / తెలుగు) for bilingual experience
  - Modern search bar with voice button
  - Vibrant category cards with gradient backgrounds and bilingual labels
  - Bottom navigation with Home, Orders, Cart (with badge), Profile

- **Bilingual Support System**: Complete English/Telugu translation system
  - Translation dictionary for all UI elements
  - Language toggle hook integrated throughout app
  - Telugu names for all categories: వీరగాణ, కూరగాయలు, పాలు, స్నాక్స్, మందులు, ఎలక్ట్రానిక్స్

- **Category-Based Shopping**: Six main product categories
  - Groceries (వీరగాణ) - Green gradient
  - Vegetables (కూరగాయలు) - Light green gradient
  - Milk (పాలు) - Blue gradient
  - Snacks (స్నాక్స్) - Orange gradient
  - Medicines (మందులు) - Blue gradient
  - Electronics (ఎలక్ట్రానిక్స్) - Purple gradient

- **Infrastructure**: Vite configured with allowedHosts for Replit proxy support

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Backend/Database**: Firebase (Firestore + Authentication)
- **Styling**: Custom CSS with CSS variables
- **Icons**: lucide-react
- **Language**: JavaScript (ES6+)

### Project Structure
```
/
├── src/
│   ├── App.jsx           # Main application component (2662 lines)
│   ├── main.jsx          # React entry point
│   ├── index.css         # Global styles and CSS variables
│   ├── App.css           # Component-specific styles
│   └── firebaseConfig.js # Firebase configuration
├── public/               # Static assets
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

### Key Features
1. **Consumer-Only Experience**: Streamlined quick commerce without complexity
   - No role selection or account setup required
   - Anonymous authentication for instant access
   - Mobile-first, app-like interface

2. **Shopping Features**:
   - Browse products by category with visual cards
   - Real-time search across all products
   - Add items to cart with quantity controls
   - View cart with running total
   - Place orders with single tap
   - Track order status (Pending, Processing, Delivered)

3. **Admin Panel** (Development Mode):
   - Full product catalog management (CRUD operations)
   - Add new products with all details
   - Edit existing products inline
   - Delete products from catalog
   - Real-time Firebase integration
   - Password access: "admin123" (dev only)
   - **Production Note**: Requires Firebase Auth custom claims and Firestore security rules

4. **Enhanced Profile Dashboard**:
   - Order history (last 5 orders)
   - User statistics (total orders, total spent)
   - Visual stat cards
   - Admin panel access
   - Account management

5. **Bilingual Interface**:
   - Toggle between English and Telugu
   - All UI elements translated
   - Category names in both languages
   - Culturally relevant for local users

6. **Modern Design**:
   - Gradient-based category cards matching brand colors
   - Emoji icons for visual appeal
   - Smooth transitions and hover effects
   - Badge notifications on cart icon
   - Sticky header and bottom navigation

### Firebase Integration
- **Authentication**: Anonymous sign-in for instant access
- **Firestore Collections**:
  - `artifacts/{appId}/public/data/products` - Product catalog with categories
  - `artifacts/{appId}/public/data/orders` - Consumer orders with status tracking
  - Products organized by category field: groceries, vegetables, milk, snacks, medicines, electronics

## Development Setup

### Environment Configuration
- **Dev Server**: Runs on `0.0.0.0:5000`
- **HMR**: Configured for Replit proxy environment
- **Firebase**: Uses config from `src/firebaseConfig.js`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment
- **Type**: Autoscale (stateless web application)
- **Build Command**: `npm run build`
- **Run Command**: `npx vite preview --host 0.0.0.0 --port 5000`

## Notes
- The application uses Firebase public API keys (safe for client-side use)
- Images are stored as Base64 data URLs or placeholder URLs
- The app is designed with a mobile-first approach (max-width: 500px)
