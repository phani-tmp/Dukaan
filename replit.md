# DUKAAN - Quick Commerce Application (ఘుకాన్)

## Overview
Dukaan is a modern quick commerce application built with React, Vite, and Firebase, inspired by Zepto. It provides a seamless direct-to-consumer shopping experience for various products like groceries, medicines, and electronics. The application features a three-level category hierarchy, comprehensive order management with flexible workflows (pickup vs. delivery), and bilingual support (English/Telugu). It aims to deliver a production-ready, scalable solution for quick commerce with a professional and intuitive user experience. Recent enhancements include a robust password-based authentication system, a streamlined checkout process with a confirmation modal, the ability for customers to change order types post-placement, improved UI/UX for order type changes, image upload capabilities for categories/subcategories, fixed price calculation consistency, and a dedicated rider dashboard for delivery management.

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
- **Code Structure**: Feature-oriented component-based architecture for maintainability and scalability, separating concerns into `components/shared`, `features/customer`, `features/auth`, `features/address`, `features/shopkeeper`, `features/rider`, `features/admin`, `contexts`, `services`, `constants`, and `utils`.

### Feature Specifications
- **Authentication**: Phone authentication with OTP for new users and password-based login for returning users, integrated with reCAPTCHA. Includes user profile management (name, email, phone).
- **Address Management**: CRUD operations for addresses with labels (Home, Work, Other), default address selection, and delivery instructions.
- **Three-Level Category Hierarchy**: Home (main categories) -> Subcategories -> Products, with back navigation.
- **Triple Interface Architecture**: Separated customer app, shopkeeper dashboard (`?mode=shopkeeper`), and rider dashboard (`?mode=rider`).
- **Comprehensive Order Management**:
    - Simplified 4-status workflow: Pending → Accepted → (Ready for Pickup / Out for Delivery) → (Completed / Delivered).
    - Customer ability to change delivery method for pending/accepted orders.
    - Shopkeeper dashboard with active/completed order tabs, product images, quantity badges, customer contact info, and status dropdowns.
    - Order cancellation with reason tracking.
    - Detailed order view modal.
- **Product Management**: CRUD for products, categories, subcategories (shopkeeper dashboard), including "out of stock" toggling, "popular" marking, and dual image input (URL or file upload with preview) for all product types.
- **Rider Dashboard**: Dedicated interface for delivery riders (`?mode=rider`) with:
    - Order categorization (Ready to Pickup, Out for Delivery, Delivered)
    - Customer contact information and delivery addresses
    - Google Maps integration for navigation
    - One-tap status updates (Pick Up, Mark as Delivered)
    - Real-time delivery statistics
- **Enhanced Order Type Modal**: Professional UI for changing delivery method with:
    - Address display using correct Firestore schema (fullAddress)
    - Beautiful gradient backgrounds and selection states
    - Improved card layouts and button styling
    - Seamless address selection experience
- **Price Calculation Consistency**: Fixed discrepancy between customer OrdersView and shopkeeper dashboard - both now correctly use discounted prices when available.
- **Voice Shopping with Gemini AI** (October 29, 2025):
    - Integrated Google Gemini 2.0 Flash (`@google/genai` v1.27.0) for AI-powered shopping
    - Voice Assistant component with floating mic button and chat interface
    - Multi-language voice recognition (Telugu/English/Hindi/Hinglish) using Web Speech API
    - Semantic product search with AI understanding of synonyms and local languages
    - Shopping chat assistant for conversational product discovery
    - Bilingual product synonym database (50+ products with translations)
    - Quick Categories swipe bar for fast navigation
    - **Security Note**: Current implementation exposes API key client-side (prototyping only); production requires server-side proxy
- **User Profile**: Enhanced section with order history, user statistics, and admin panel access.
- **Real-time Notifications**: Toast notifications for order status updates.

### System Design Choices
- **Authentication**: Hybrid authentication (OTP for verification, password for convenience) for a village-friendly approach.
- **Data Structure**: Firestore collections for `products`, `orders`, `categories`, `subcategories`, and `users`. Products link to categories and subcategories.
- **Scalability**: Designed as a stateless web application.
- **Idempotent Seed Data**: Prevents duplicate data entry in Firebase.

## External Dependencies
- **Firebase**: Utilized for Firestore (database), Authentication (phone and anonymous sign-in), and potentially Firebase Storage for image hosting.
- **Google Gemini AI**: Used for voice-powered shopping, semantic search, and language translation (`@google/genai` package).
- **Web Speech API**: Browser-native speech recognition for voice input.
- **Unsplash**: Source for real product images.
- **placeholder.com**: Used for fallback images.
- **lucide-react**: For vector icons.

## Voice Shopping Implementation Notes (October 29, 2025)

### How It Works
1. **Customer Experience**:
   - Click floating green mic button (bottom-right)
   - Speak naturally in Telugu, English, or Hindi (e.g., "2 కిలో ఉల్లిపాయ ఇవ్వండి" or "I need milk")
   - AI translates and matches products from entire catalog
   - Products automatically added to cart or shown as search results
   
2. **Technical Flow**:
   - Voice → Web Speech API → Text
   - Text → Gemini AI (full product catalog sent) → Product matching
   - High-confidence matches (>0.7) → Auto-add to cart
   - Lower confidence → Show as search results
   - Chat assistant with complete product awareness

3. **Technical Implementation**:
   - **Gemini SDK**: Uses `@google/genai` v1.27.0 with correct API patterns
   - **API Call Structure**: `genAI.models.generateContent({ model, contents })`
   - **Response Access**: `result.text` (property getter, not method)
   - **Product Context**: Entire catalog sent to all AI functions (no truncation)
   - **Five AI Functions**: translateToProductName, extractProductFromVoice, detectLanguage, semanticProductSearch, chatAssistant

4. **Shopkeeper Feature** (Pending):
   - Voice product entry: "3 లీటర్ గోవు పాలు 50 రూపాయలు"
   - AI extracts: name, price, quantity, unit, category
   - Auto-fills product form

### Future Enhancements
- Server-side API proxy for production security (CRITICAL for production)
- Offline voice command caching
- Voice-based order tracking updates
- Gemini-powered delivery route optimization
- Daily sales insights in Telugu for shopkeepers
- Token usage optimization if catalog grows significantly