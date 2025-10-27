import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseConfig, localAppId } from './firebaseConfig.js';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, getDoc, updateDoc, where, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

// Icon Imports 
import { Search, MapPin, ShoppingCart, User, Home, Package, ChevronLeft, Minus, Plus, IndianRupee, Mic, LogOut, CheckCircle, Clock, ShoppingBag, Truck, Check, X, Settings, PlusCircle, Edit, Trash2, Save, Image as ImageIcon, Upload, Star, Phone, Eye, XCircle } from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const appId = localAppId;
const fireConfig = firebaseConfig;
let app, db, auth;

// --- BILINGUAL SUPPORT ---
const translations = {
  en: {
    appName: 'DUKAAN',
    search: 'Search for groceries, services...',
    deliveryTo: 'Delivery to',
    categories: {
      groceries: 'Groceries',
      vegetables: 'Vegetables',
      milk: 'Milk',
      snacks: 'Snacks',
      medicines: 'Medicines',
      electronics: 'Electronics'
    },
    popularProducts: 'Popular Products',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    orders: 'Orders',
    profile: 'Profile',
    home: 'Home',
    viewCart: 'View Cart',
    items: 'Items',
    checkout: 'Checkout',
    total: 'Total',
    placeOrder: 'Place Order',
    myOrders: 'My Orders',
    logout: 'Logout',
    empty: 'Empty',
    noOrders: 'No orders yet',
    orderPlaced: 'Order Placed',
    processing: 'Processing',
    delivered: 'Delivered',
    admin: 'Admin',
    addProduct: 'Add Product',
    productName: 'Product Name',
    productPrice: 'Price',
    productWeight: 'Weight',
    productImage: 'Image URL',
    category: 'Category',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    orderHistory: 'Order History',
    totalOrders: 'Total Orders',
    totalSpent: 'Total Spent',
    enterAdminCode: 'Enter Admin Code',
    adminPanel: 'Admin Panel',
    manageProducts: 'Manage Products',
    shopkeeperDashboard: 'Shopkeeper Dashboard',
    incomingOrders: 'Incoming Orders',
    orderDetails: 'Order Details',
    customer: 'Customer',
    updateStatus: 'Update Status',
    markProcessing: 'Mark as Processing',
    markDelivered: 'Mark as Delivered',
    noIncomingOrders: 'No orders yet',
    ordersTab: 'Orders',
    productsTab: 'Products'
  },
  te: {
    appName: 'దుకాణ్',
    search: 'కిరాణా సరుకులు వెతకండి...',
    deliveryTo: 'డెలివరీ స్థలం',
    categories: {
      groceries: 'వీరగాణ',
      vegetables: 'కూరగాయలు',
      milk: 'పాలు',
      snacks: 'స్నాక్స్',
      medicines: 'మందులు',
      electronics: 'ఎలక్ట్రానిక్స్'
    },
    popularProducts: 'ప్రజాదరణ ఉత్పత్తులు',
    addToCart: 'కార్ట్‌కు జోడించు',
    cart: 'కార్ట్',
    orders: 'ఆర్డర్లు',
    profile: 'ప్రొఫైల్',
    home: 'హోమ్',
    viewCart: 'కార్ట్ చూడండి',
    items: 'వస్తువులు',
    checkout: 'చెక్అవుట్',
    total: 'మొత్తం',
    placeOrder: 'ఆర్డర్ చేయండి',
    myOrders: 'నా ఆర్డర్లు',
    logout: 'లాగ్అవుట్',
    empty: 'ఖాళీ',
    noOrders: 'ఆర్డర్లు లేవు',
    orderPlaced: 'ఆర్డర్ చేయబడింది',
    processing: 'ప్రాసెస్ అవుతోంది',
    delivered: 'డెలివరీ అయ్యింది',
    admin: 'అడ్మిన్',
    addProduct: 'ఉత్పత్తిని జోడించండి',
    productName: 'ఉత్పత్తి పేరు',
    productPrice: 'ధర',
    productWeight: 'బరువు',
    productImage: 'చిత్ర URL',
    category: 'వర్గం',
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు',
    delete: 'తొలగించు',
    edit: 'సవరించు',
    orderHistory: 'ఆర్డర్ చరిత్ర',
    totalOrders: 'మొత్తం ఆర్డర్లు',
    totalSpent: 'మొత్తం ఖర్చు',
    enterAdminCode: 'అడ్మిన్ కోడ్ నమోదు చేయండి',
    adminPanel: 'అడ్మిన్ ప్యానెల్',
    manageProducts: 'ఉత్పత్తులను నిర్వహించండి',
    shopkeeperDashboard: 'దుకాణదారుడి డాష్‌బోర్డ్',
    incomingOrders: 'ఇన్‌కమింగ్ ఆర్డర్లు',
    orderDetails: 'ఆర్డర్ వివరాలు',
    customer: 'కస్టమర్',
    updateStatus: 'స్థితిని అప్‌డేట్ చేయండి',
    markProcessing: 'ప్రాసెసింగ్‌గా గుర్తించండి',
    markDelivered: 'డెలివరీ అయినట్లు గుర్తించండి',
    noIncomingOrders: 'ఆర్డర్లు లేవు',
    ordersTab: 'ఆర్డర్లు',
    productsTab: 'ఉత్పత్తులు'
  }
};

// --- CATEGORY DATA WITH BILINGUAL LABELS (Fallback) ---
const categories = [
  { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=100&h=100&fit=crop', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
  { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)' },
  { id: 'milk', nameEn: 'Milk', nameTe: 'పాలు', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop', color: '#5DADE2', gradient: 'linear-gradient(135deg, #5DADE2 0%, #74B9E8 100%)' },
  { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)' },
  { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
  { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop', color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #AB47BC 100%)' }
];

// --- SHARED COMPONENTS ---

const LoadingSpinner = () => (
  <div className="flex-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <p className="ml-3 text-green-700 font-medium">Loading...</p>
  </div>
);

// --- APP HEADER ---
const AppHeader = ({ searchTerm, setSearchTerm, location, language, toggleLanguage, logoUrl }) => {
  const t = translations[language];
  
  return (
    <div className="app-header-modern">
      {/* Location and Language Bar */}
      <div className="location-bar">
        <div className="location-info">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="app-logo" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
          <span className="location-text">{location || 'Ponnur, AP'}</span>
        </div>
        <button onClick={toggleLanguage} className="language-toggle">
          {language === 'en' ? 'EN / తెలుగు' : 'తెలుగు / EN'}
        </button>
      </div>

      {/* App Title */}
      <h1 className="app-title">{t.appName}</h1>

      {/* Search Bar */}
      <div className="search-bar-modern">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="voice-button">
          <Mic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- CATEGORY CARDS ---
const CategoryGrid = ({ categoriesData, onCategoryClick, language }) => {
  const t = translations[language];

  return (
    <div className="category-section">
      <div className="category-grid">
        {categoriesData.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.id)}
            className="category-card"
            style={{ background: cat.gradient }}
          >
            <div className="category-icon">
              <img 
                src={cat.imageUrl || 'https://via.placeholder.com/50/CCCCCC/666666?text=No+Image'} 
                alt={cat.nameEn} 
                className="category-image" 
              />
            </div>
            <div className="category-labels">
              <div className="category-name-en">{cat.nameEn}</div>
              <div className="category-name-te">/ {cat.nameTe}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- PRODUCT CARD ---
const ProductCard = ({ product, onAddToCart, cartItems, language }) => {
  const t = translations[language];
  const quantity = cartItems[product.id]?.quantity || 0;
  const isOutOfStock = product.outOfStock === true;

  return (
    <div className={`product-card-modern ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150'} 
        alt={product.name}
        className="product-image"
      />
      {isOutOfStock && (
        <div className="out-of-stock-overlay">
          <span className="out-of-stock-badge">OUT OF STOCK</span>
        </div>
      )}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-weight">{product.weight}</p>
        <div className="product-price-row">
          <span className="product-price">
            <IndianRupee className="w-4 h-4" />
            {product.discountedPrice || product.price}
          </span>
          {product.discountedPrice && (
            <span className="product-original-price">
              <IndianRupee className="w-3 h-3" />
              {product.price}
            </span>
          )}
        </div>
      </div>
      
      {isOutOfStock ? (
        <button
          className="add-to-cart-btn disabled-btn"
          disabled
        >
          Out of Stock
        </button>
      ) : quantity === 0 ? (
        <button
          onClick={() => onAddToCart(product)}
          className="add-to-cart-btn"
        >
          {t.addToCart}
        </button>
      ) : (
        <div className="quantity-controls">
          <button onClick={() => onAddToCart(product, -1)} className="quantity-btn">
            <Minus className="w-4 h-4" />
          </button>
          <span className="quantity-display">{quantity}</span>
          <button onClick={() => onAddToCart(product, 1)} className="quantity-btn">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// --- HOME VIEW (with Subcategory Support) ---
const HomeView = ({ 
  products, 
  onAddToCart, 
  cartItems, 
  setCurrentView, 
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  searchTerm, 
  language,
  categoriesData,
  subcategoriesData
}) => {
  const t = translations[language];

  // When searching: show all matching products (search by product name only)
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // When NOT searching: show only products marked as popular
  const popularProducts = useMemo(() => {
    return products.filter(p => p.isPopular === true);
  }, [products]);

  // Show search results OR popular products (like Zepto/Amazon)
  const isSearching = searchTerm.trim().length > 0;

  // Get subcategories for selected category
  const categorySubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategoriesData.filter(sc => sc.categoryId === selectedCategory);
  }, [subcategoriesData, selectedCategory]);

  // Get products for selected subcategory (with fallback for legacy products)
  const subcategoryProducts = useMemo(() => {
    if (!selectedSubcategory) return [];
    // Include products that:
    // 1. Match the subcategoryId (new products)
    // 2. OR have matching category but no subcategoryId (legacy products as fallback)
    return products.filter(p => 
      p.subcategoryId === selectedSubcategory ||
      (!p.subcategoryId && selectedCategory && subcategoriesData.find(sc => sc.id === selectedSubcategory)?.categoryId === p.category)
    );
  }, [products, selectedSubcategory, selectedCategory, subcategoriesData]);

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  // Handle subcategory click
  const handleSubcategoryClick = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  // Handle back navigation
  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // LEVEL 3: Viewing products in a subcategory
  if (selectedSubcategory) {
    const subcategory = subcategoriesData.find(sc => sc.id === selectedSubcategory);
    const category = categoriesData.find(c => c.id === selectedCategory);
    
    return (
      <div className="subcategory-products-view">
        <div className="view-header">
          <button onClick={handleBack} className="back-button">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="view-title">
            {language === 'en' ? subcategory?.nameEn : subcategory?.nameTe || subcategory?.nameEn}
          </h2>
        </div>
        <div className="products-grid">
          {subcategoryProducts.length > 0 ? (
            subcategoryProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                cartItems={cartItems}
                language={language}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No products in this subcategory yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LEVEL 2: Viewing subcategories of a category (OR products if no subcategories)
  if (selectedCategory) {
    const category = categoriesData.find(c => c.id === selectedCategory);
    
    // If category has NO subcategories, show products directly
    if (categorySubcategories.length === 0) {
      const categoryProducts = products.filter(p => p.category === selectedCategory);
      
      return (
        <div className="subcategory-products-view">
          <div className="view-header">
            <button onClick={handleBack} className="back-button">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="view-title">
              {language === 'en' ? category?.nameEn : category?.nameTe || category?.nameEn}
            </h2>
          </div>
          <div className="products-grid">
            {categoryProducts.length > 0 ? (
              categoryProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  language={language}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No products in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // If category HAS subcategories, show them
    return (
      <div className="subcategories-view">
        <div className="view-header">
          <button onClick={handleBack} className="back-button">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="view-title">
            {language === 'en' ? category?.nameEn : category?.nameTe || category?.nameEn}
          </h2>
        </div>
        <div className="subcategory-grid">
          {categorySubcategories.map(subcategory => (
            <button
              key={subcategory.id}
              onClick={() => handleSubcategoryClick(subcategory.id)}
              className="subcategory-card"
            >
              <span className="subcategory-icon">
                <img 
                  src={subcategory.imageUrl || 'https://via.placeholder.com/48/CCCCCC/666666?text=No+Image'} 
                  alt={subcategory.nameEn} 
                  className="subcategory-image" 
                />
              </span>
              <span className="subcategory-name">
                {language === 'en' ? subcategory.nameEn : subcategory.nameTe || subcategory.nameEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // LEVEL 1: Main home view with categories and popular products
  return (
    <div className="home-view">
      {!isSearching && (
        <CategoryGrid 
          categoriesData={categoriesData}
          onCategoryClick={handleCategoryClick}
          language={language}
        />
      )}

      {isSearching ? (
        <div className="search-results-section">
          <h2 className="section-title">Search Results ({searchResults.length})</h2>
          {searchResults.length > 0 ? (
            <div className="products-grid">
              {searchResults.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No products found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="popular-section">
          <h2 className="section-title">{t.popularProducts}</h2>
          {popularProducts.length > 0 ? (
            <div className="products-grid">
              {popularProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  cartItems={cartItems}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No popular products yet. Visit Shopkeeper Dashboard to mark products as popular.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- CATEGORY PRODUCTS VIEW ---
const CategoryProductsView = ({ products, selectedCategory, onAddToCart, cartItems, setCurrentView, language }) => {
  const t = translations[language];
  const category = categories.find(c => c.id === selectedCategory);
  
  const categoryProducts = products.filter(p => p.category === selectedCategory);

  return (
    <div className="category-products-view">
      <div className="view-header">
        <button onClick={() => setCurrentView('Home')} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{category?.nameEn} / {category?.nameTe}</h2>
      </div>

      <div className="products-grid">
        {categoryProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            cartItems={cartItems}
            language={language}
          />
        ))}
      </div>
    </div>
  );
};

// --- CART VIEW ---
const CartView = ({ cartItems, onAddToCart, setCurrentView, onCheckout, language, deliveryMethod, setDeliveryMethod, userAddresses, selectedAddress, setSelectedAddress }) => {
  const t = translations[language];
  const items = Object.values(cartItems);
  const total = items.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <ShoppingCart className="empty-icon" />
        <p className="empty-text">{t.cart} {t.empty}</p>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <div className="view-header">
        <button onClick={() => setCurrentView('Home')} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{t.cart}</h2>
      </div>

      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-weight">{item.weight}</p>
              <p className="cart-item-price">
                <IndianRupee className="w-4 h-4" />
                {item.discountedPrice || item.price}
              </p>
            </div>
            <div className="quantity-controls">
              <button onClick={() => onAddToCart(item, -1)} className="quantity-btn">
                <Minus className="w-4 h-4" />
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button onClick={() => onAddToCart(item, 1)} className="quantity-btn">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Method Selection */}
      <div className="delivery-method-section">
        <h3 className="section-title">Delivery Method</h3>
        <div className="delivery-options">
          <button 
            className={`delivery-option-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
            onClick={() => setDeliveryMethod('delivery')}
          >
            <Truck className="w-5 h-5" />
            <span>Home Delivery</span>
          </button>
          <button 
            className={`delivery-option-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
            onClick={() => setDeliveryMethod('pickup')}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Store Pickup</span>
          </button>
        </div>
      </div>

      {/* Address Selection (only for delivery) */}
      {deliveryMethod === 'delivery' && (
        <div className="address-selection-section">
          <h3 className="section-title">Delivery Address</h3>
          {userAddresses.length === 0 ? (
            <div className="no-address-msg">
              <p>No saved addresses. Please add an address from your Profile.</p>
              <button onClick={() => setCurrentView('Profile')} className="add-address-link">
                Add Address
              </button>
            </div>
          ) : (
            <div className="address-options">
              {userAddresses.map(addr => (
                <div 
                  key={addr.id} 
                  className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <div className="address-radio">
                    {selectedAddress?.id === addr.id && <Check className="w-4 h-4" />}
                  </div>
                  <div className="address-content">
                    <div className="address-label-row">
                      <span className={`address-label-badge ${addr.label.toLowerCase()}`}>
                        {addr.label}
                      </span>
                      {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                    </div>
                    <p className="address-text-small">{addr.fullAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="cart-footer">
        <div className="cart-total">
          <span>{t.total}</span>
          <span className="total-amount">
            <IndianRupee className="w-5 h-5" />
            {total.toFixed(0)}
          </span>
        </div>
        <button onClick={onCheckout} className="checkout-button">
          {t.placeOrder}
        </button>
      </div>
    </div>
  );
};

// --- ORDERS VIEW (Amazon-style - Active Orders Only) ---
const OrdersView = ({ orders, setCurrentView, language }) => {
  const t = translations[language];

  // Filter to show only ACTIVE orders (not delivered, but include cancelled to show cancellation reason)
  const activeOrders = orders.filter(order => order.status !== 'delivered');

  if (activeOrders.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" />
        <p className="empty-text">No active orders</p>
      </div>
    );
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: t.orderPlaced || 'Pending',
      accepted: 'Accepted',
      out_for_delivery: 'Out for Delivery',
      delivered: t.delivered || 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5" />;
    if (status === 'out_for_delivery') return <Truck className="w-5 h-5" />;
    if (status === 'accepted') return <CheckCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'accepted': return '#2196F3';
      case 'out_for_delivery': return '#FF9800';
      case 'cancelled': return '#f44336';
      case 'pending': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="orders-view">
      <h2 className="view-title">Active Orders</h2>
      <div className="orders-list">
        {activeOrders.map(order => (
          <div key={order.id} className="order-card-detailed">
            {/* Order Header */}
            <div className="order-header-detailed">
              <div className="order-info-row">
                <div className="order-meta">
                  <span className="order-date-label">Order Date</span>
                  <span className="order-date-value">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>

            {/* Order Items - Amazon Style */}
            <div className="order-items-detailed">
              {order.items.map((item, idx) => {
                // Debug: Log item data to console
                console.log('[Order Item Debug]', {
                  name: item.name,
                  hasImageUrl: !!item.imageUrl,
                  imageUrl: item.imageUrl,
                  weight: item.weight
                });
                return (
                  <div key={idx} className="order-item-card">
                    <div className="order-item-image">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/80?text=No+Image'} 
                        alt={item.name}
                        onError={(e) => {
                          console.log('[Image Error]', item.name, 'failed to load:', item.imageUrl);
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="order-item-details">
                      <h4 className="order-item-name">{item.name}</h4>
                      <p className="order-item-weight">{item.weight || 'N/A'}</p>
                      <div className="order-item-pricing">
                        <span className="order-item-quantity">Qty: {item.quantity}</span>
                        <span className="order-item-price">
                          <IndianRupee className="w-3 h-3" />
                          {item.price.toFixed(0)} each
                        </span>
                      </div>
                    </div>
                    <div className="order-item-total">
                      <IndianRupee className="w-4 h-4" />
                      {(item.price * item.quantity).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cancellation Reason (if cancelled) */}
            {order.status === 'cancelled' && order.cancellationReason && (
              <div className="order-cancellation-section">
                <div className="cancellation-badge">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="cancellation-label">Cancellation Reason:</span>
                </div>
                <p className="cancellation-reason-text">{order.cancellationReason}</p>
              </div>
            )}

            {/* Order Footer */}
            <div className="order-footer-detailed">
              <div className="order-total-row">
                <span className="order-total-label">Order Total</span>
                <span className="order-total-amount">
                  <IndianRupee className="w-5 h-5" />
                  {order.total.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ADMIN PANEL ---
const AdminPanel = ({ products, language, onClose }) => {
  const t = translations[language];
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '',
    weight: '',
    imageUrl: '',
    category: 'groceries'
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), productData);
        alert('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);
        alert('Product added successfully!');
      }

      setFormData({ name: '', price: '', discountedPrice: '', weight: '', imageUrl: '', category: 'groceries' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      weight: product.weight,
      imageUrl: product.imageUrl || '',
      category: product.category
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="admin-panel">
      <div className="view-header">
        <button onClick={onClose} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{t.adminPanel}</h2>
      </div>

      <div className="admin-content">
        <button onClick={() => setShowForm(!showForm)} className="add-product-btn">
          <PlusCircle className="w-5 h-5" />
          {t.addProduct}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="product-form">
            <input
              type="text"
              placeholder={t.productName}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="number"
              placeholder={t.productPrice}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="number"
              placeholder="Discounted Price (Optional)"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              placeholder={t.productWeight}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
              className="form-input"
            />
            <input
              type="text"
              placeholder={t.productImage}
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="form-input"
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn} / {cat.nameTe}
                </option>
              ))}
            </select>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                <Save className="w-4 h-4" />
                {t.save}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="cancel-btn">
                {t.cancel}
              </button>
            </div>
          </form>
        )}

        <div className="products-admin-list">
          <h3 className="section-subtitle">{t.manageProducts} ({products.length})</h3>
          {products.map(product => (
            <div key={product.id} className="admin-product-card">
              <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className="admin-product-img" />
              <div className="admin-product-info">
                <h4>{product.name}</h4>
                <p>{product.category} • {product.weight}</p>
                <p className="admin-price">₹{product.discountedPrice || product.price}</p>
              </div>
              <div className="admin-product-actions">
                <button onClick={() => handleEdit(product)} className="edit-btn">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(product.id)} className="delete-btn">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SEED DEFAULT DATA ---
const seedDefaultData = async () => {
  try {
    // Check if already seeded
    const categoriesSnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'categories'));
    if (!categoriesSnapshot.empty) {
      alert('Categories already exist. Clear existing categories first if you want to reseed.');
      return;
    }

    // Default categories (Zepto-style) - using deterministic IDs with placeholder images
    const defaultCategories = [
      { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=100&h=100&fit=crop', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
      { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)' },
      { id: 'milk', nameEn: 'Milk & Dairy', nameTe: 'పాలు', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop', color: '#5DADE2', gradient: 'linear-gradient(135deg, #5DADE2 0%, #74B9E8 100%)' },
      { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=100&h=100&fit=crop', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)' },
      { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
      { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop', color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #AB47BC 100%)' }
    ];

    // Default subcategories (Zepto-style) - using deterministic IDs with placeholder images
    const defaultSubcategories = [
      // Groceries subcategories
      { id: 'groceries-dals', nameEn: 'Dals & Pulses', nameTe: 'పప్పులు', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1572449102205-d51f05b2a0e0?w=100&h=100&fit=crop' },
      { id: 'groceries-rice', nameEn: 'Rice & Rice Products', nameTe: 'అన్నం', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=100&fit=crop' },
      { id: 'groceries-oils', nameEn: 'Oils & Ghee', nameTe: 'నూనెలు', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop' },
      { id: 'groceries-spices', nameEn: 'Spices', nameTe: 'మసాలా', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a0b0b7b98adc?w=100&h=100&fit=crop' },
      { id: 'groceries-flours', nameEn: 'Flours & Atta', nameTe: 'పిండి', categoryId: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100&h=100&fit=crop' },
      
      // Vegetables subcategories
      { id: 'vegetables-leafy', nameEn: 'Leafy Vegetables', nameTe: 'ఆకు కూరలు', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&h=100&fit=crop' },
      { id: 'vegetables-root', nameEn: 'Root Vegetables', nameTe: 'వేళ్ళు', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=100&h=100&fit=crop' },
      { id: 'vegetables-seasonal', nameEn: 'Seasonal Vegetables', nameTe: 'కాల కూరలు', categoryId: 'vegetables', imageUrl: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=100&h=100&fit=crop' },
      
      // Milk & Dairy subcategories
      { id: 'milk-fresh', nameEn: 'Fresh Milk', nameTe: 'పాలు', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop' },
      { id: 'milk-curd', nameEn: 'Curd & Yogurt', nameTe: 'పెరుగు', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1571212515935-c0629c19f520?w=100&h=100&fit=crop' },
      { id: 'milk-butter', nameEn: 'Butter & Ghee', nameTe: 'వెన్న', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100&h=100&fit=crop' },
      { id: 'milk-cheese', nameEn: 'Cheese & Paneer', nameTe: 'పన్నీర్', categoryId: 'milk', imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=100&h=100&fit=crop' },
      
      // Snacks subcategories
      { id: 'snacks-namkeen', nameEn: 'Namkeen', nameTe: 'నమ్కీన్', categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=100&h=100&fit=crop' },
      { id: 'snacks-biscuits', nameEn: 'Biscuits & Cookies', nameTe: 'బిస్కెట్లు', categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100&h=100&fit=crop' },
      { id: 'snacks-chips', nameEn: 'Chips', nameTe: 'చిప్స్', categoryId: 'snacks', imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec8b5d2a?w=100&h=100&fit=crop' },
      
      // Medicines subcategories
      { id: 'medicines-firstaid', nameEn: 'First Aid', nameTe: 'ప్రాథమిక చికిత్స', categoryId: 'medicines', imageUrl: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=100&h=100&fit=crop' },
      { id: 'medicines-supplements', nameEn: 'Health Supplements', nameTe: 'ఆరోగ్య', categoryId: 'medicines', imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100&h=100&fit=crop' },
      
      // Electronics subcategories
      { id: 'electronics-mobiles', nameEn: 'Mobiles & Accessories', nameTe: 'మొబైల్స్', categoryId: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop' },
      { id: 'electronics-headphones', nameEn: 'Headphones & Earphones', nameTe: 'హెడ్‌ఫోన్లు', categoryId: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop' },
      { id: 'electronics-chargers', nameEn: 'Chargers & Cables', nameTe: 'చార్జర్లు', categoryId: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=100&h=100&fit=crop' }
    ];

    // Add categories with deterministic IDs
    for (const cat of defaultCategories) {
      const { id, ...catData } = cat;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', id), {
        ...catData,
        createdAt: new Date().toISOString()
      });
    }

    // Add subcategories with deterministic IDs
    for (const subcat of defaultSubcategories) {
      const { id, ...subcatData } = subcat;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', id), {
        ...subcatData,
        createdAt: new Date().toISOString()
      });
    }

    alert('Default categories and subcategories added successfully! Refresh the page to see them.');
  } catch (error) {
    console.error('Error seeding data:', error);
    alert(`Failed to seed data: ${error.message}`);
  }
};

// --- USERS MANAGEMENT COMPONENT ---
const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      usersData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-state">Loading users...</div>;
  }

  return (
    <div className="users-section">
      <div className="section-header">
        <h3 className="section-subtitle">Registered Users</h3>
        <span className="count-badge">{users.length}</span>
      </div>
      <p className="section-description">
        All users who have registered via phone authentication.
      </p>

      {users.length === 0 ? (
        <div className="empty-state">
          <User className="empty-icon" />
          <p className="empty-text">No users registered yet</p>
        </div>
      ) : (
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">
                <User className="w-8 h-8" />
              </div>
              <div className="user-info">
                <h4 className="user-name">{user.name || 'No name'}</h4>
                <p className="user-phone">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${user.phoneNumber}`}>{user.phoneNumber}</a>
                </p>
                {user.email && <p className="user-email">{user.email}</p>}
                <p className="user-date">
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- SHOPKEEPER DASHBOARD ---
const ShopkeeperDashboard = ({ products, allOrders, language, onExit, categoriesData, subcategoriesData }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('orders');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountedPrice: '',
    weight: '',
    imageUrl: '',
    category: '',
    subcategoryId: '',
    isPopular: false,
    outOfStock: false
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  
  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    nameEn: '',
    nameTe: '',
    imageUrl: '',
    color: '#4CAF50',
    gradient: ''
  });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  // Subcategory management state
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    nameEn: '',
    nameTe: '',
    categoryId: '',
    icon: ''
  });
  const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [orderTab, setOrderTab] = useState('active'); // 'active' or 'completed'
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) {
        alert('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    console.log('[Shopkeeper] Updating order:', orderId, 'to status:', newStatus);
    console.log('[Shopkeeper] DB available:', !!db, 'AppId:', appId);
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      alert(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Failed to update order status: ${error.message}`);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter reason for cancellation:');
    if (!reason || reason.trim() === '') return;
    
    try {
      if (!db) throw new Error('Firebase database not initialized');
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), {
        status: 'cancelled',
        cancellationReason: reason.trim(),
        updatedAt: new Date().toISOString()
      });
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrderForDetails(order);
    setShowOrderDetails(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.category || !formData.subcategoryId) {
      alert('Please select both Category and Subcategory before saving the product.');
      return;
    }
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        isPopular: formData.isPopular || false,
        createdAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingId), productData);
        alert('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), productData);
        alert('Product added successfully!');
      }

      setFormData({ name: '', price: '', discountedPrice: '', weight: '', imageUrl: '', category: '', subcategoryId: '', isPopular: false, outOfStock: false });
      setImagePreview(null);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || '',
      weight: product.weight,
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      subcategoryId: product.subcategoryId || '',
      isPopular: product.isPopular || false,
      outOfStock: product.outOfStock || false
    });
    setImagePreview(product.imageUrl || null);
    setEditingId(product.id);
    setShowForm(true);
    setActiveTab('products');
  };

  const handleDeleteProduct = async (productId) => {
    console.log('[Shopkeeper] Delete product clicked:', productId);
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        if (!db) {
          throw new Error('Firebase database not initialized');
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId));
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Failed to delete product: ${error.message}`);
      }
    }
  };

  const togglePopularStatus = async (productId, currentStatus) => {
    console.log('[Shopkeeper] Toggle popular:', productId, 'current:', currentStatus);
    try {
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId), {
        isPopular: !currentStatus
      });
      console.log('[Shopkeeper] Popular status updated successfully');
    } catch (error) {
      console.error('Error updating popular status:', error);
      alert(`Failed to update popular status: ${error.message}`);
    }
  };

  // Category handlers
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...categoryFormData,
        gradient: categoryFormData.gradient || `linear-gradient(135deg, ${categoryFormData.color} 0%, ${categoryFormData.color}dd 100%)`,
        createdAt: new Date().toISOString()
      };

      if (editingCategoryId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', editingCategoryId), categoryData);
        alert('Category updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'categories'), categoryData);
        alert('Category added successfully!');
      }

      setCategoryFormData({ nameEn: '', nameTe: '', imageUrl: '', color: '#4CAF50', gradient: '' });
      setShowCategoryForm(false);
      setEditingCategoryId(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setCategoryFormData({
      nameEn: category.nameEn,
      nameTe: category.nameTe || '',
      icon: category.icon || '',
      color: category.color || '#4CAF50',
      gradient: category.gradient || ''
    });
    setEditingCategoryId(category.id);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure? This will affect related subcategories and products.')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'categories', categoryId));
        alert('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(`Failed to delete category: ${error.message}`);
      }
    }
  };

  // Subcategory handlers
  const handleSubmitSubcategory = async (e) => {
    e.preventDefault();
    try {
      const subcategoryData = {
        ...subcategoryFormData,
        createdAt: new Date().toISOString()
      };

      if (editingSubcategoryId) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', editingSubcategoryId), subcategoryData);
        alert('Subcategory updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'subcategories'), subcategoryData);
        alert('Subcategory added successfully!');
      }

      setSubcategoryFormData({ nameEn: '', nameTe: '', categoryId: '', imageUrl: '' });
      setShowSubcategoryForm(false);
      setEditingSubcategoryId(null);
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Failed to save subcategory');
    }
  };

  const handleEditSubcategory = (subcategory) => {
    setSubcategoryFormData({
      nameEn: subcategory.nameEn,
      nameTe: subcategory.nameTe || '',
      categoryId: subcategory.categoryId,
      icon: subcategory.icon || ''
    });
    setEditingSubcategoryId(subcategory.id);
    setShowSubcategoryForm(true);
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (window.confirm('Are you sure? This will affect related products.')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'subcategories', subcategoryId));
        alert('Subcategory deleted successfully!');
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        alert(`Failed to delete subcategory: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#9E9E9E';
      case 'accepted': return '#2196F3';
      case 'out_for_delivery': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#9E9E9E';
    }
  };

  // Filter orders based on tab selection
  const activeStatuses = ['pending', 'accepted', 'out_for_delivery'];
  const completedStatuses = ['delivered', 'cancelled'];
  
  const filteredOrders = allOrders.filter(order => {
    if (orderTab === 'active') {
      return activeStatuses.includes(order.status);
    } else {
      return completedStatuses.includes(order.status);
    }
  });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularProducts = products.filter(p => p.isPopular);

  return (
    <div className="shopkeeper-dashboard">
      <div className="view-header">
        <button onClick={onExit} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{t.shopkeeperDashboard}</h2>
      </div>

      <div className="shopkeeper-search-bar">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products, orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="shopkeeper-tabs">
        <button 
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package className="w-5 h-5" />
          Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Settings className="w-5 h-5" />
          Categories
        </button>
        <button 
          className={`tab-button ${activeTab === 'subcategories' ? 'active' : ''}`}
          onClick={() => setActiveTab('subcategories')}
        >
          <ShoppingBag className="w-5 h-5" />
          Subcategories
        </button>
        <button 
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package className="w-5 h-5" />
          Products
        </button>
        <button 
          className={`tab-button ${activeTab === 'popular' ? 'active' : ''}`}
          onClick={() => setActiveTab('popular')}
        >
          <Star className="w-5 h-5" />
          Popular
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <User className="w-5 h-5" />
          Users
        </button>
      </div>

      <div className="shopkeeper-content">
        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h3 className="section-subtitle">Orders Management</h3>
              <span className="count-badge">{allOrders.length}</span>
            </div>
            
            {/* Order Tabs for Active/Completed */}
            <div className="order-tabs">
              <button 
                className={`order-tab-btn ${orderTab === 'active' ? 'active' : ''}`}
                onClick={() => setOrderTab('active')}
              >
                Active Orders ({activeStatuses.reduce((count, status) => 
                  count + allOrders.filter(o => o.status === status).length, 0)})
              </button>
              <button 
                className={`order-tab-btn ${orderTab === 'completed' ? 'active' : ''}`}
                onClick={() => setOrderTab('completed')}
              >
                Completed Orders ({completedStatuses.reduce((count, status) => 
                  count + allOrders.filter(o => o.status === status).length, 0)})
              </button>
            </div>
            {sortedOrders.length === 0 ? (
              <div className="empty-state">
                <Package className="w-16 h-16 text-gray-400" />
                <p>{t.noIncomingOrders}</p>
              </div>
            ) : (
              <div className="shopkeeper-orders-list">
                {sortedOrders.map(order => (
                  <div key={order.id} className="shopkeeper-order-card-enhanced">
                    <div className="order-card-top">
                      <div className="order-info-section">
                        <div className="order-id-row">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="order-customer">Order #{order.id.substring(0, 8)}</span>
                        </div>
                        <div className="order-time-row">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="order-timestamp">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                        {order.phoneNumber && (
                          <div className="order-phone-row">
                            <Phone className="w-4 h-4 text-green-600" />
                            <a href={`tel:${order.phoneNumber}`} className="order-phone-link">
                              {order.phoneNumber}
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="order-status-badge-new" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                    
                    {order.deliveryAddress && (
                      <div className="order-address-section">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="order-address-text">{order.deliveryAddress}</span>
                      </div>
                    )}
                    
                    <div className="order-items-list-enhanced">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row-enhanced">
                          <img 
                            src={item.imageUrl || 'https://via.placeholder.com/50'} 
                            alt={item.name} 
                            className="order-item-image"
                          />
                          <div className="order-item-details">
                            <span className="item-name">{item.name}</span>
                            <span className="item-weight">{item.weight}</span>
                          </div>
                          <span className="item-quantity-badge">× {item.quantity}</span>
                          <span className="item-price-bold">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-card-bottom">
                      <div className="order-total-section">
                        <span className="total-label">{t.total}</span>
                        <span className="total-amount-large">₹{order.total.toFixed(0)}</span>
                      </div>
                      
                      <div className="order-management-section">
                        <div className="order-status-controls">
                          <label className="status-dropdown-label">Status:</label>
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="status-dropdown"
                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        <div className="order-action-buttons">
                          <button 
                            onClick={() => handleViewOrderDetails(order)}
                            className="view-details-btn"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="cancel-order-btn"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <button onClick={() => setShowForm(!showForm)} className="add-product-btn">
              <PlusCircle className="w-5 h-5" />
              {t.addProduct}
            </button>

            {showForm && (
              <form onSubmit={handleSubmitProduct} className="product-form">
                <input
                  type="text"
                  placeholder={t.productName}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder={t.productPrice}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="number"
                  placeholder="Discounted Price (Optional)"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder={t.productWeight}
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                  className="form-input"
                />
                
                <div className="image-upload-section">
                  <label className="upload-label">
                    <Upload className="w-5 h-5" />
                    Upload Image (Max 500KB)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input-hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste image URL"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="form-input"
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>

                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategoryId: '' })}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesData.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn} / {cat.nameTe || ''}
                    </option>
                  ))}
                </select>
                
                {formData.category && (
                  <select
                    value={formData.subcategoryId}
                    onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoriesData
                      .filter(sc => sc.categoryId === formData.category)
                      .map(sc => (
                        <option key={sc.id} value={sc.id}>
                          {sc.nameEn} / {sc.nameTe || ''}
                        </option>
                      ))}
                  </select>
                )}

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  />
                  Mark as Popular Product
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.outOfStock}
                    onChange={(e) => setFormData({ ...formData, outOfStock: e.target.checked })}
                  />
                  Out of Stock (unavailable for pickup/delivery)
                </label>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <Save className="w-4 h-4" />
                    {t.save}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setImagePreview(null); }} className="cancel-btn">
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}

            <div className="category-filters">
              <button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All ({products.length})
              </button>
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                return (
                  <button 
                    key={cat.id}
                    className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.nameEn} ({count})
                  </button>
                );
              })}
            </div>

            <div className="products-admin-list">
              <h3 className="section-subtitle">{t.manageProducts} ({filteredProducts.length})</h3>
              {filteredProducts.map(product => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className="admin-product-img" />
                  <div className="admin-product-info">
                    <h4>{product.name}</h4>
                    <p>{product.category} • {product.weight}</p>
                    <p className="admin-price">₹{product.discountedPrice || product.price}</p>
                    {product.isPopular && <span className="popular-tag">⭐ Popular</span>}
                  </div>
                  <div className="admin-product-actions">
                    <button onClick={() => handleEditProduct(product)} className="edit-btn">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-section">
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="add-product-btn">
                <PlusCircle className="w-5 h-5" />
                Add Category
              </button>
              {categoriesData.length === 0 && (
                <button onClick={seedDefaultData} className="add-product-btn" style={{ background: '#FF9800' }}>
                  <Settings className="w-5 h-5" />
                  Seed Default Data (Zepto-style)
                </button>
              )}
            </div>

            {showCategoryForm && (
              <form onSubmit={handleSubmitCategory} className="product-form">
                <input
                  type="text"
                  placeholder="Category Name (English)"
                  value={categoryFormData.nameEn}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Category Name (Telugu)"
                  value={categoryFormData.nameTe}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, nameTe: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Image URL (e.g., https://...)"
                  value={categoryFormData.imageUrl}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, imageUrl: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="color"
                  value={categoryFormData.color}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                  className="form-input"
                />
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button type="button" onClick={() => { setShowCategoryForm(false); setEditingCategoryId(null); }} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="products-admin-list">
              <h3 className="section-subtitle">Manage Categories ({categoriesData.length})</h3>
              {categoriesData.map(category => (
                <div key={category.id} className="admin-product-card">
                  <div className="category-icon-preview" style={{ background: category.gradient }}>
                    <img 
                      src={category.imageUrl || 'https://via.placeholder.com/40/CCCCCC/666666?text=No+Image'} 
                      alt={category.nameEn} 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  </div>
                  <div className="admin-product-info">
                    <h4>{category.nameEn}</h4>
                    <p>{category.nameTe}</p>
                    <p className="admin-price">{category.color}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button onClick={() => handleEditCategory(category)} className="edit-btn">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="delete-btn">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'subcategories' && (
          <div className="subcategories-section">
            <button onClick={() => setShowSubcategoryForm(!showSubcategoryForm)} className="add-product-btn">
              <PlusCircle className="w-5 h-5" />
              Add Subcategory
            </button>

            {showSubcategoryForm && (
              <form onSubmit={handleSubmitSubcategory} className="product-form">
                <select
                  value={subcategoryFormData.categoryId}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Select Parent Category</option>
                  {categoriesData.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Subcategory Name (English)"
                  value={subcategoryFormData.nameEn}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, nameEn: e.target.value })}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Subcategory Name (Telugu)"
                  value={subcategoryFormData.nameTe}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, nameTe: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Image URL (e.g., https://...)"
                  value={subcategoryFormData.imageUrl}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, imageUrl: e.target.value })}
                  className="form-input"
                />
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button type="button" onClick={() => { setShowSubcategoryForm(false); setEditingSubcategoryId(null); }} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="products-admin-list">
              <h3 className="section-subtitle">Manage Subcategories ({subcategoriesData.length})</h3>
              {subcategoriesData.map(subcategory => {
                const parentCategory = categoriesData.find(c => c.id === subcategory.categoryId);
                return (
                  <div key={subcategory.id} className="admin-product-card">
                    <div className="subcategory-icon-preview">
                      <img 
                        src={subcategory.imageUrl || 'https://via.placeholder.com/40/CCCCCC/666666?text=No+Image'} 
                        alt={subcategory.nameEn} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                    </div>
                    <div className="admin-product-info">
                      <h4>{subcategory.nameEn}</h4>
                      <p>{subcategory.nameTe}</p>
                      <p className="admin-price">Parent: {parentCategory?.nameEn || 'N/A'}</p>
                    </div>
                    <div className="admin-product-actions">
                      <button onClick={() => handleEditSubcategory(subcategory)} className="edit-btn">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSubcategory(subcategory.id)} className="delete-btn">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'popular' && (
          <div className="popular-section">
            <div className="section-header">
              <h3 className="section-subtitle">Popular Products Management</h3>
              <span className="count-badge">{popularProducts.length}</span>
            </div>
            <p className="section-description">
              Manage which products appear in the "Popular Products" section on the customer app. 
              Toggle the star to add/remove from popular items.
            </p>

            <div className="products-admin-list">
              {products.map(product => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.imageUrl || 'https://via.placeholder.com/60'} alt={product.name} className="admin-product-img" />
                  <div className="admin-product-info">
                    <h4>{product.name}</h4>
                    <p>{product.category} • {product.weight}</p>
                    <p className="admin-price">₹{product.discountedPrice || product.price}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button 
                      onClick={() => togglePopularStatus(product.id, product.isPopular)}
                      className={`popular-toggle-btn ${product.isPopular ? 'is-popular' : ''}`}
                      title={product.isPopular ? 'Remove from popular' : 'Add to popular'}
                    >
                      {product.isPopular ? <Star fill="gold" stroke="gold" className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersManagement />
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrderForDetails && (
        <OrderDetailsModal 
          order={selectedOrderForDetails} 
          onClose={() => setShowOrderDetails(false)}
          language={language}
        />
      )}
    </div>
  );
};

// --- ORDER DETAILS MODAL ---
const OrderDetailsModal = ({ order, onClose, language }) => {
  const t = translations[language];

  const getStatusText = (status) => {
    const statusMap = {
      pending: t.orderPlaced,
      processing: t.processing,
      delivered: t.delivered
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return '#4CAF50';
    if (status === 'processing') return '#2196F3';
    return '#FF9800';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header with Close Button */}
        <div className="modal-header">
          <h3 className="modal-title">Order Details</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Order Info */}
        <div className="modal-body">
          <div className="modal-order-info">
            <div className="modal-info-row">
              <span className="modal-label">Order ID</span>
              <span className="modal-value">#{order.id.substring(0, 12)}</span>
            </div>
            <div className="modal-info-row">
              <span className="modal-label">Order Date</span>
              <span className="modal-value">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="modal-info-row">
              <span className="modal-label">Status</span>
              <span className="modal-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                {getStatusText(order.status)}
              </span>
            </div>
            {order.phoneNumber && (
              <div className="modal-info-row">
                <span className="modal-label">Customer Phone</span>
                <a href={`tel:${order.phoneNumber}`} className="modal-phone-link">
                  <Phone className="w-4 h-4" />
                  {order.phoneNumber}
                </a>
              </div>
            )}
          </div>

          {/* Delivery Details */}
          {order.deliveryAddress && (
            <div className="modal-delivery-section">
              <h4 className="modal-section-title">Delivery Details</h4>
              <div className="modal-address-card">
                <MapPin className="w-5 h-5 text-green-600" />
                <div className="modal-address-content">
                  <p className="modal-address-text">{order.deliveryAddress}</p>
                  {order.deliveryInstructions && (
                    <p className="modal-instructions-text">
                      <strong>Instructions:</strong> {order.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="modal-items-section">
            <h4 className="modal-section-title">Items Ordered</h4>
            <div className="modal-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="modal-item-card">
                  <div className="modal-item-image">
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/60'} 
                      alt={item.name}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                    />
                  </div>
                  <div className="modal-item-details">
                    <h5 className="modal-item-name">{item.name}</h5>
                    <p className="modal-item-weight">{item.weight}</p>
                    <p className="modal-item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <div className="modal-item-price">
                    <IndianRupee className="w-4 h-4" />
                    {(item.price * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="modal-total-section">
            <span className="modal-total-label">Order Total</span>
            <span className="modal-total-amount">
              <IndianRupee className="w-5 h-5" />
              {order.total.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ORDER HISTORY VIEW ---
const OrderHistoryView = ({ orders, onBack, onSelectOrder, language }) => {
  const t = translations[language];

  return (
    <div className="order-history-view">
      <div className="view-header">
        <button onClick={onBack} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">Order History</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package className="empty-icon" />
          <p className="empty-text">{t.noOrders}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="order-history-item clickable"
              onClick={() => onSelectOrder(order)}
            >
              <div className="order-history-info">
                <p className="order-history-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="order-history-items">
                  {order.items.length} items • {order.status}
                </p>
              </div>
              <div className="order-history-right">
                <p className="order-history-price">₹{order.total.toFixed(0)}</p>
                <ChevronLeft className="chevron-icon" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- PROFILE SETUP MODAL ---
const ProfileSetupModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Welcome! Set Up Your Profile</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-setup-form">
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">
            <Save className="w-5 h-5" />
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ADDRESS FORM ---
const AddressForm = ({ onSave, onClose, editingAddress }) => {
  const [formData, setFormData] = useState({
    label: editingAddress?.label || 'Home',
    fullAddress: editingAddress?.fullAddress || '',
    deliveryInstructions: editingAddress?.deliveryInstructions || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.fullAddress.trim()) {
      alert('Please enter an address');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="address-form">
          <div className="form-group">
            <label className="form-label">Address Label</label>
            <select
              className="form-input"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Full Address</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Enter complete delivery address"
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              required
            />
            <p className="form-hint">In Phase 2, this will use Google Maps for easy address selection</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Delivery Instructions (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Ring bell twice, Gate code 1234"
              value={formData.deliveryInstructions}
              onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="w-5 h-5" />
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ADDRESS MANAGER ---
const AddressManager = ({ 
  addresses, 
  onAddAddress, 
  onEditAddress, 
  onDeleteAddress, 
  onSetDefault,
  onClose
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content address-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Manage Addresses</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="address-manager-body">
          <button onClick={onAddAddress} className="add-address-btn">
            <PlusCircle className="w-5 h-5" />
            Add New Address
          </button>
          
          {addresses.length === 0 ? (
            <div className="empty-state">
              <MapPin className="w-16 h-16 text-gray-400" />
              <p>No saved addresses yet</p>
            </div>
          ) : (
            <div className="addresses-list">
              {addresses.map(address => (
                <div key={address.id} className="address-card">
                  <div className="address-card-header">
                    <div className="address-label-section">
                      <span className={`address-label-badge ${address.label.toLowerCase()}`}>
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <div className="address-actions">
                      <button 
                        onClick={() => onEditAddress(address)} 
                        className="icon-btn"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteAddress(address.id)} 
                        className="icon-btn delete"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="address-card-body">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="address-text">{address.fullAddress}</p>
                  </div>
                  
                  {address.deliveryInstructions && (
                    <p className="address-instructions">
                      <strong>Instructions:</strong> {address.deliveryInstructions}
                    </p>
                  )}
                  
                  {!address.isDefault && (
                    <button 
                      onClick={() => onSetDefault(address.id)}
                      className="set-default-btn"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- PROFILE VIEW ---
const ProfileView = ({ userProfile, orders, onLogout, language, setCurrentView, userAddresses, onManageAddresses }) => {
  const t = translations[language];

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="profile-view">
      <h2 className="view-title">{t.profile}</h2>
      
      <div className="profile-info">
        <div className="profile-avatar">
          <User className="w-12 h-12" />
        </div>
        {userProfile ? (
          <div>
            <p className="profile-name">{userProfile.name}</p>
            <p className="profile-phone">{userProfile.phoneNumber}</p>
          </div>
        ) : (
          <p className="profile-id">Loading profile...</p>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <Package className="w-6 h-6 text-green-600" />
          <div>
            <p className="stat-value">{totalOrders}</p>
            <p className="stat-label">{t.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <IndianRupee className="w-6 h-6 text-green-600" />
          <div>
            <p className="stat-value">₹{totalSpent.toFixed(0)}</p>
            <p className="stat-label">{t.totalSpent}</p>
          </div>
        </div>
      </div>

      {/* Address Management Button */}
      <div className="profile-section">
        <button 
          className="order-history-button"
          onClick={onManageAddresses}
        >
          <MapPin className="w-5 h-5" />
          <span>Manage Addresses ({userAddresses.length})</span>
          <ChevronLeft className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Order History Button */}
      <div className="profile-section">
        <button 
          className="order-history-button"
          onClick={() => setCurrentView('OrderHistory')}
        >
          <Package className="w-5 h-5" />
          <span>View Order History ({totalOrders})</span>
          <ChevronLeft className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <button onClick={onLogout} className="logout-button">
        <LogOut className="w-5 h-5" />
        {t.logout}
      </button>
    </div>
  );
};

// --- PHONE LOGIN UI ---
const PhoneLoginUI = ({ 
  countryCode, 
  phoneNumber, 
  otp, 
  authStep,
  onCountryCodeChange,
  onPhoneChange,
  onOtpChange,
  onSendOTP,
  onVerifyOTP
}) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">DUKAAN ఘుకాన్</h1>
          <p className="login-subtitle">Quick Commerce at your doorstep</p>
        </div>

        {authStep === 'phone' ? (
          <div className="login-form">
            <h2 className="form-title">Sign in with Phone</h2>
            <p className="form-hint">Enter your phone number to receive an OTP</p>
            
            <div className="phone-input-group">
              <select 
                value={countryCode} 
                onChange={(e) => onCountryCodeChange(e.target.value)}
                className="country-code-select"
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (UAE)</option>
              </select>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="phone-input"
                maxLength="10"
              />
            </div>
            
            <button onClick={onSendOTP} className="login-btn">
              <Phone className="w-5 h-5" />
              Send OTP
            </button>
            
            <div id="recaptcha-container"></div>
          </div>
        ) : (
          <div className="login-form">
            <h2 className="form-title">Enter OTP</h2>
            <p className="form-hint">We sent a 6-digit code to {countryCode}{phoneNumber}</p>
            
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => onOtpChange(e.target.value)}
              className="otp-input"
              maxLength="6"
            />
            
            <button onClick={onVerifyOTP} className="login-btn">
              <CheckCircle className="w-5 h-5" />
              Verify & Login
            </button>
            
            <button 
              onClick={() => authStep === 'otp' && window.location.reload()} 
              className="back-btn"
            >
              Back to Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- TOAST NOTIFICATION ---
const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        {type === 'info' && <Package className="w-5 h-5" />}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="toast-close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- BOTTOM NAVIGATION ---
const BottomNavigation = ({ currentView, setCurrentView, cartItems, language }) => {
  const t = translations[language];
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: t.home, icon: Home, view: 'Home' },
    { name: t.orders, icon: Package, view: 'Orders' },
    { name: t.cart, icon: ShoppingCart, view: 'Cart', badge: totalItems },
    { name: t.profile, icon: User, view: 'Profile' },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.view}
          onClick={() => setCurrentView(item.view)}
          className={`nav-item ${currentView === item.view ? 'nav-item-active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <item.icon className="w-6 h-6" />
            {item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </div>
          <span className="nav-label">{item.name}</span>
        </button>
      ))}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('Home');
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('Ponnur, AP');
  const [logoUrl, setLogoUrl] = useState('/dukaan-logo.png'); // Dukaan logo
  const [notification, setNotification] = useState(null);
  const [previousOrderStatuses, setPreviousOrderStatuses] = useState({});
  const [isShopkeeperMode, setIsShopkeeperMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [subcategoriesData, setSubcategoriesData] = useState([]);
  
  // User Profile & Address Management
  const [userProfile, setUserProfile] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'pickup'
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  // Phone Authentication
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authStep, setAuthStep] = useState('phone'); // 'phone' or 'otp'

  // Detect shopkeeper mode from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    setIsShopkeeperMode(mode === 'shopkeeper');
    console.log('[Mode] Shopkeeper mode:', mode === 'shopkeeper', 'URL:', window.location.search);
  }, []);

  // Initialize Firebase
  useEffect(() => {
    app = initializeApp(fireConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Auth] User authenticated:', firebaseUser.uid);
        setUser(firebaseUser);
        setLoading(false);
      } else {
        console.log('[Auth] No user authenticated');
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load categories from Firebase
  useEffect(() => {
    if (!user) return;

    const categoriesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'categories'));
    const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesDataFromDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // If no categories in DB, use hardcoded defaults
      if (categoriesDataFromDB.length === 0) {
        setCategoriesData(categories);
      } else {
        setCategoriesData(categoriesDataFromDB);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load subcategories from Firebase
  useEffect(() => {
    if (!user) return;

    const subcategoriesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'subcategories'));
    const unsubscribe = onSnapshot(subcategoriesQuery, (snapshot) => {
      const subcategoriesDataFromDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubcategoriesData(subcategoriesDataFromDB);
    });

    return () => unsubscribe();
  }, [user]);

  // Load products from Firebase
  useEffect(() => {
    if (!user) return;

    const productsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Load user orders (for customer view)
  useEffect(() => {
    if (!user || isShopkeeperMode) return;

    const ordersQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [user, isShopkeeperMode]);

  // Load all orders (for shopkeeper dashboard)
  useEffect(() => {
    if (!user || !isShopkeeperMode) return;

    const allOrdersQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
    
    const unsubscribe = onSnapshot(allOrdersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isShopkeeperMode]);

  // Monitor order status changes and show notifications (for customers)
  useEffect(() => {
    if (!user || isShopkeeperMode || orders.length === 0) return;

    // Build current status map
    const currentStatuses = {};
    orders.forEach(order => {
      currentStatuses[order.id] = order.status;
    });

    // Check for status changes
    orders.forEach(order => {
      const previousStatus = previousOrderStatuses[order.id];
      const currentStatus = order.status;

      // If status changed and order was recently updated
      if (previousStatus && previousStatus !== currentStatus && order.updatedAt) {
        const updateTime = new Date(order.updatedAt).getTime();
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - updateTime;

        // If updated within last 10 seconds, show notification
        if (timeDiff < 10000) {
          if (currentStatus === 'processing') {
            setNotification({
              message: '🎉 Your order has been accepted! We are preparing it now.',
              type: 'success'
            });
          } else if (currentStatus === 'delivered') {
            setNotification({
              message: '✅ Your order has been delivered! Thank you for shopping with us.',
              type: 'success'
            });
          }
        }
      }
    });

    // Update previous statuses
    setPreviousOrderStatuses(currentStatuses);
  }, [orders, user, isShopkeeperMode]);

  // reCAPTCHA is initialized when user clicks "Send OTP" button
  // This avoids early initialization errors

  // Load user profile from Firebase
  useEffect(() => {
    if (!user || isShopkeeperMode) return;

    const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        // No profile yet - show setup modal for first-time users
        setShowProfileSetup(true);
      }
    });

    return () => unsubscribe();
  }, [user, isShopkeeperMode]);

  // Load user addresses from Firebase
  useEffect(() => {
    if (!user || isShopkeeperMode) return;

    const addressesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'addresses'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(addressesQuery, (snapshot) => {
      const addressesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      addressesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUserAddresses(addressesData);
    });

    return () => unsubscribe();
  }, [user, isShopkeeperMode]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  // Phone Authentication - Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    if (!auth) {
      alert('Authentication not initialized. Please refresh the page.');
      return;
    }

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      
      // Clear any existing verifier
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('[Auth] Error clearing old verifier:', e);
        }
        window.recaptchaVerifier = null;
      }
      
      // Create new reCAPTCHA verifier with proper auth instance
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('[Auth] reCAPTCHA verified');
        }
      });
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setAuthStep('otp');
      alert('OTP sent successfully!');
    } catch (error) {
      console.error('[Auth] OTP send error:', error);
      // Clear and reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('[Auth] Error clearing verifier:', e);
        }
        window.recaptchaVerifier = null;
      }
      alert(`Failed to send OTP: ${error.message}. Please try again.`);
    }
  };

  // Phone Authentication - Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      alert('Please request OTP first');
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp);
      console.log('[Auth] Login successful for user:', result.user.uid);
      
      // Check if this is a first-time user
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // First-time user - show profile setup modal
        setShowProfileSetup(true);
      }
      
      setOtp('');
      setPhoneNumber('');
      setAuthStep('phone');
    } catch (error) {
      console.error('[Auth] OTP verification error:', error);
      alert('Invalid OTP. Please try again.');
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setUserAddresses([]);
      setCartItems({});
      setOrders([]);
      setCurrentView('Home');
      alert('Logged out successfully!');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      alert('Failed to logout');
    }
  };

  const handleAddToCart = useCallback((product, quantityChange = 1) => {
    setCartItems(prev => {
      const currentQty = prev[product.id]?.quantity || 0;
      const newQty = currentQty + quantityChange;

      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[product.id];
        return newCart;
      }

      return {
        ...prev,
        [product.id]: { ...product, quantity: newQty }
      };
    });
  }, []);

  // Save or update user profile
  const handleSaveProfile = async (profileData) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      await setDoc(userDocRef, {
        ...profileData,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      setShowProfileSetup(false);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  // Save or update address
  const handleSaveAddress = async (addressData) => {
    if (!user) return;
    
    try {
      if (editingAddress?.id) {
        // Update existing address
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'addresses', editingAddress.id), {
          ...addressData,
          updatedAt: new Date().toISOString()
        });
        alert('Address updated successfully!');
      } else {
        // Create new address
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'addresses'), {
          ...addressData,
          userId: user.uid,
          isDefault: userAddresses.length === 0, // First address is default
          createdAt: new Date().toISOString()
        });
        alert('Address added successfully!');
      }
      
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!user) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this address?');
    if (!confirmDelete) return;
    
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'addresses', addressId));
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  // Set address as default
  const handleSetDefaultAddress = async (addressId) => {
    if (!user) return;
    
    try {
      // Unset all addresses as default
      const batch = [];
      userAddresses.forEach(addr => {
        const addressRef = doc(db, 'artifacts', appId, 'public', 'data', 'addresses', addr.id);
        batch.push(updateDoc(addressRef, { isDefault: false }));
      });
      await Promise.all(batch);
      
      // Set selected address as default
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'addresses', addressId), {
        isDefault: true
      });
      
      // Update user profile with default address ID
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
        defaultAddressId: addressId
      });
      
      alert('Default address updated!');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const handleCheckout = useCallback(async () => {
    if (Object.keys(cartItems).length === 0) return;

    // Check if user has profile set up
    if (!userProfile || !userProfile.phoneNumber) {
      alert('Please set up your profile first (Profile tab → Add your details)');
      setCurrentView('Profile');
      return;
    }

    // Check if delivery method requires address
    if (deliveryMethod === 'delivery') {
      if (userAddresses.length === 0) {
        alert('Please add a delivery address first (Profile tab → Manage Addresses)');
        setCurrentView('Profile');
        return;
      }
      if (!selectedAddress) {
        alert('Please select a delivery address');
        return;
      }
    }

    const items = Object.values(cartItems);
    const total = items.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0);

    const orderData = {
      userId: user.uid,
      userName: userProfile.name || 'Customer',
      userPhone: userProfile.phoneNumber,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.discountedPrice || item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || '',
        weight: item.weight || '',
        category: item.category || ''
      })),
      total,
      status: 'pending',
      phoneNumber: userProfile.phoneNumber,
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? selectedAddress.fullAddress : 'Store Pickup',
      deliveryInstructions: deliveryMethod === 'delivery' ? (selectedAddress.deliveryInstructions || '') : '',
      selectedAddressId: deliveryMethod === 'delivery' ? selectedAddress.id : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      setCartItems({});
      setCurrentView('Orders');
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  }, [cartItems, user, userProfile, userAddresses, deliveryMethod, selectedAddress]);

  // Auto-select default address when addresses load
  useEffect(() => {
    if (userAddresses.length > 0 && !selectedAddress) {
      const defaultAddr = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [userAddresses]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isShopkeeperMode) {
    return (
      <ShopkeeperDashboard
        products={products}
        allOrders={allOrders}
        language={language}
        onExit={() => window.location.href = '/'}
        categoriesData={categoriesData}
        subcategoriesData={subcategoriesData}
      />
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <>
        <PhoneLoginUI
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          otp={otp}
          authStep={authStep}
          onCountryCodeChange={setCountryCode}
          onPhoneChange={setPhoneNumber}
          onOtpChange={setOtp}
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleVerifyOTP}
        />
        {notification && (
          <ToastNotification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-container-modern">
      <AppHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        language={language}
        toggleLanguage={toggleLanguage}
        logoUrl={logoUrl}
      />

      <div className="app-content">
        {currentView === 'Home' && (
          <HomeView
            products={products}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            setCurrentView={setCurrentView}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
            searchTerm={searchTerm}
            language={language}
            categoriesData={categoriesData}
            subcategoriesData={subcategoriesData}
          />
        )}

        {currentView === 'CategoryProducts' && (
          <CategoryProductsView
            products={products}
            selectedCategory={selectedCategory}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            setCurrentView={setCurrentView}
            language={language}
          />
        )}

        {currentView === 'Cart' && (
          <CartView
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            setCurrentView={setCurrentView}
            onCheckout={handleCheckout}
            language={language}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            userAddresses={userAddresses}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
          />
        )}

        {currentView === 'Orders' && (
          <OrdersView
            orders={orders}
            setCurrentView={setCurrentView}
            language={language}
            onSelectOrder={setSelectedOrder}
          />
        )}

        {currentView === 'Profile' && (
          <ProfileView
            userProfile={userProfile}
            orders={orders}
            onLogout={handleLogout}
            language={language}
            setCurrentView={setCurrentView}
            userAddresses={userAddresses}
            onManageAddresses={() => setShowAddressManager(true)}
          />
        )}

        {currentView === 'OrderHistory' && (
          <OrderHistoryView
            orders={orders}
            onBack={() => setCurrentView('Profile')}
            onSelectOrder={setSelectedOrder}
            language={language}
          />
        )}
      </div>

      <BottomNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartItems={cartItems}
        language={language}
      />

      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          language={language}
        />
      )}

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetupModal
          onSave={handleSaveProfile}
          onClose={() => setShowProfileSetup(false)}
        />
      )}

      {/* Address Manager Modal */}
      {showAddressManager && (
        <AddressManager
          addresses={userAddresses}
          onAddAddress={() => {
            setShowAddressManager(false);
            setShowAddressForm(true);
            setEditingAddress(null);
          }}
          onEditAddress={(address) => {
            setEditingAddress(address);
            setShowAddressManager(false);
            setShowAddressForm(true);
          }}
          onDeleteAddress={handleDeleteAddress}
          onSetDefault={handleSetDefaultAddress}
          onClose={() => setShowAddressManager(false)}
        />
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <AddressForm
          onSave={handleSaveAddress}
          onClose={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
          editingAddress={editingAddress}
        />
      )}
    </div>
  );
}

export default App;
