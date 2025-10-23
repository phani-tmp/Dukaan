# Dukan - Quick Commerce Application (దుకాణ్)

## Overview
Dukan is a modern quick commerce application built with React, Vite, and Firebase. Inspired by Zepto, it provides a seamless direct-to-consumer shopping experience for groceries, kirana items, medicines, snacks, and electronics. The app features bilingual support (English/Telugu) for better local accessibility.

## Recent Changes (October 23, 2025)
- **Major Transformation to Quick Commerce Model**: Complete pivot from dual-mode marketplace to consumer-only app
  - Removed all shopkeeper/provider functionality (dashboard, store management, order handling)
  - Rebuilt app from scratch as pure consumer experience like Zepto
  - No role selection - direct access to shopping experience

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

3. **Bilingual Interface**:
   - Toggle between English and Telugu
   - All UI elements translated
   - Category names in both languages
   - Culturally relevant for local users

4. **Modern Design**:
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
