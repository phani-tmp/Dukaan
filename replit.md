# Dukaan - Local Marketplace Application

## Overview
Dukaan is a local marketplace application built with React, Vite, and Firebase. It allows users to either be buyers (customers) who can browse local stores and place orders, or providers (shopkeepers) who can register their stores, manage products, and handle incoming orders.

## Recent Changes (October 23, 2025)
- Successfully migrated GitHub import to Replit environment
- Uncommented and cleaned up App.jsx (removed duplicate code sections)
- Configured Vite for Replit with proper host settings (0.0.0.0:5000)
- Set up development workflow for frontend server
- Configured deployment settings for production (autoscale)
- Updated .gitignore with proper Node.js exclusions
- **Implemented Search & Filter System**: Added complete search functionality across stores and products
  - Search bar now functional with real-time filtering
  - Filters stores by name, location, and products they sell
  - Filters products by name and category within store views
  - Dynamic search results with helpful "no results" messaging

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
1. **Role-Based Access**: Users can choose to be buyers or shopkeepers
2. **Buyer Features**:
   - Browse local stores with real-time search
   - Search for products across all stores by name or category
   - Filter products within individual stores
   - View products by category
   - Add items to cart
   - Place and track orders
3. **Shopkeeper Features**:
   - Register and manage store
   - Add/manage products with images
   - Track and update order status
   - View dashboard with order metrics
4. **Search & Discovery**:
   - Global search across stores and products
   - Real-time filtering as you type
   - Category-based browsing
   - Smart search matching on product names, categories, and store details

### Firebase Integration
- **Authentication**: Anonymous sign-in for local development
- **Firestore Collections**:
  - `artifacts/{appId}/users/{userId}/profile/data` - User profiles
  - `artifacts/{appId}/public/data/stores` - Store listings
  - `artifacts/{appId}/public/data/products` - Product catalog
  - `artifacts/{appId}/public/data/orders` - Order management

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
