import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseConfig, localAppId } from './firebaseConfig.js';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, getDoc, updateDoc, where, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

// Icon Imports 
import { Search, MapPin, ShoppingCart, User, Home, Package, ChevronLeft, Minus, Plus, IndianRupee, Mic, LogOut, CheckCircle, Clock, ShoppingBag, Truck, Check, X, Settings, PlusCircle, Edit, Trash2, Save, Image as ImageIcon, Upload, Star } from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const appId = localAppId;
const fireConfig = firebaseConfig;
let app, db, auth;

// --- BILINGUAL SUPPORT ---
const translations = {
  en: {
    appName: 'Dukan',
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

// --- CATEGORY DATA WITH BILINGUAL LABELS ---
const categories = [
  { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', icon: '🏪', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
  { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', icon: '🥬', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)' },
  { id: 'milk', nameEn: 'Milk', nameTe: 'పాలు', icon: '🥛', color: '#5DADE2', gradient: 'linear-gradient(135deg, #5DADE2 0%, #74B9E8 100%)' },
  { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', icon: '🍿', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)' },
  { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', icon: '💊', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
  { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', icon: '📱', color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #AB47BC 100%)' }
];

// --- SHARED COMPONENTS ---

const LoadingSpinner = () => (
  <div className="flex-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <p className="ml-3 text-green-700 font-medium">Loading...</p>
  </div>
);

// --- APP HEADER ---
const AppHeader = ({ searchTerm, setSearchTerm, location, language, toggleLanguage }) => {
  const t = translations[language];
  
  return (
    <div className="app-header-modern">
      {/* Location and Language Bar */}
      <div className="location-bar">
        <div className="location-info">
          <MapPin className="w-4 h-4" />
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
            <div className="category-icon">{cat.icon}</div>
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

  return (
    <div className="product-card-modern">
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150'} 
        alt={product.name}
        className="product-image"
      />
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
      
      {quantity === 0 ? (
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

  // When searching: show all matching products
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.category && p.category.toLowerCase().includes(term))
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

  // LEVEL 2: Viewing subcategories of a category
  if (selectedCategory) {
    const category = categoriesData.find(c => c.id === selectedCategory);
    
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
          {categorySubcategories.length > 0 ? (
            categorySubcategories.map(subcategory => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory.id)}
                className="subcategory-card"
              >
                <span className="subcategory-icon">{subcategory.icon || '📦'}</span>
                <span className="subcategory-name">
                  {language === 'en' ? subcategory.nameEn : subcategory.nameTe || subcategory.nameEn}
                </span>
              </button>
            ))
          ) : (
            <div className="empty-state">
              <p>No subcategories yet. Visit Shopkeeper Dashboard to add subcategories.</p>
            </div>
          )}
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
const CartView = ({ cartItems, onAddToCart, setCurrentView, onCheckout, language }) => {
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

  // Filter to show only ACTIVE orders (pending/processing)
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
      pending: t.orderPlaced,
      processing: t.processing,
      delivered: t.delivered
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5" />;
    if (status === 'processing') return <Truck className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return '#4CAF50';
    if (status === 'processing') return '#2196F3';
    return '#FF9800';
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

    // Default categories (Zepto-style) - using deterministic IDs
    const defaultCategories = [
      { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', icon: '🏪', color: '#4CAF50', gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' },
      { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', icon: '🥬', color: '#8BC34A', gradient: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)' },
      { id: 'milk', nameEn: 'Milk & Dairy', nameTe: 'పాలు', icon: '🥛', color: '#5DADE2', gradient: 'linear-gradient(135deg, #5DADE2 0%, #74B9E8 100%)' },
      { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', icon: '🍿', color: '#FF9800', gradient: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)' },
      { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', icon: '💊', color: '#2196F3', gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)' },
      { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', icon: '📱', color: '#9C27B0', gradient: 'linear-gradient(135deg, #9C27B0 0%, #AB47BC 100%)' }
    ];

    // Default subcategories (Zepto-style) - using deterministic IDs
    const defaultSubcategories = [
      // Groceries subcategories
      { id: 'groceries-dals', nameEn: 'Dals & Pulses', nameTe: 'పప్పులు', categoryId: 'groceries', icon: '🫘' },
      { id: 'groceries-rice', nameEn: 'Rice & Rice Products', nameTe: 'అన్నం', categoryId: 'groceries', icon: '🍚' },
      { id: 'groceries-oils', nameEn: 'Oils & Ghee', nameTe: 'నూనెలు', categoryId: 'groceries', icon: '🛢️' },
      { id: 'groceries-spices', nameEn: 'Spices', nameTe: 'మసాలా', categoryId: 'groceries', icon: '🌶️' },
      { id: 'groceries-flours', nameEn: 'Flours & Atta', nameTe: 'పిండి', categoryId: 'groceries', icon: '🌾' },
      
      // Vegetables subcategories
      { id: 'vegetables-leafy', nameEn: 'Leafy Vegetables', nameTe: 'ఆకు కూరలు', categoryId: 'vegetables', icon: '🥬' },
      { id: 'vegetables-root', nameEn: 'Root Vegetables', nameTe: 'వేళ్ళు', categoryId: 'vegetables', icon: '🥕' },
      { id: 'vegetables-seasonal', nameEn: 'Seasonal Vegetables', nameTe: 'కాల కూరలు', categoryId: 'vegetables', icon: '🥒' },
      
      // Milk & Dairy subcategories
      { id: 'milk-fresh', nameEn: 'Fresh Milk', nameTe: 'పాలు', categoryId: 'milk', icon: '🥛' },
      { id: 'milk-curd', nameEn: 'Curd & Yogurt', nameTe: 'పెరుగు', categoryId: 'milk', icon: '🍶' },
      { id: 'milk-butter', nameEn: 'Butter & Ghee', nameTe: 'వెన్న', categoryId: 'milk', icon: '🧈' },
      { id: 'milk-cheese', nameEn: 'Cheese & Paneer', nameTe: 'పన్నీర్', categoryId: 'milk', icon: '🧀' },
      
      // Snacks subcategories
      { id: 'snacks-namkeen', nameEn: 'Namkeen', nameTe: 'నమ్కీన్', categoryId: 'snacks', icon: '🥨' },
      { id: 'snacks-biscuits', nameEn: 'Biscuits & Cookies', nameTe: 'బిస్కెట్లు', categoryId: 'snacks', icon: '🍪' },
      { id: 'snacks-chips', nameEn: 'Chips', nameTe: 'చిప్స్', categoryId: 'snacks', icon: '🍟' },
      
      // Medicines subcategories
      { id: 'medicines-firstaid', nameEn: 'First Aid', nameTe: 'ప్రాథమిక చికిత్స', categoryId: 'medicines', icon: '🩹' },
      { id: 'medicines-supplements', nameEn: 'Health Supplements', nameTe: 'ఆరోగ్య', categoryId: 'medicines', icon: '💊' },
      
      // Electronics subcategories
      { id: 'electronics-mobiles', nameEn: 'Mobiles & Accessories', nameTe: 'మొబైల్స్', categoryId: 'electronics', icon: '📱' },
      { id: 'electronics-headphones', nameEn: 'Headphones & Earphones', nameTe: 'హెడ్‌ఫోన్లు', categoryId: 'electronics', icon: '🎧' },
      { id: 'electronics-chargers', nameEn: 'Chargers & Cables', nameTe: 'చార్జర్లు', categoryId: 'electronics', icon: '🔌' }
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
    isPopular: false
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
    icon: '',
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

      setFormData({ name: '', price: '', discountedPrice: '', weight: '', imageUrl: '', category: '', subcategoryId: '', isPopular: false });
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
      isPopular: product.isPopular || false
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

      setCategoryFormData({ nameEn: '', nameTe: '', icon: '', color: '#4CAF50', gradient: '' });
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

      setSubcategoryFormData({ nameEn: '', nameTe: '', categoryId: '', icon: '' });
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
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'delivered': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const sortedOrders = [...allOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
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
      </div>

      <div className="shopkeeper-content">
        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="section-header">
              <h3 className="section-subtitle">{t.incomingOrders}</h3>
              <span className="count-badge">{sortedOrders.length}</span>
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
                          <span className="order-customer">{order.userId?.substring(0, 12)}...</span>
                        </div>
                        <div className="order-time-row">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="order-timestamp">{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="order-status-badge-new" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="order-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">× {item.quantity}</span>
                          <span className="item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-card-bottom">
                      <div className="order-total-section">
                        <span className="total-label">{t.total}</span>
                        <span className="total-amount-large">₹{order.total.toFixed(0)}</span>
                      </div>
                      
                      <div className="order-actions">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'processing')}
                            className="status-btn processing-btn"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept Order
                          </button>
                        )}
                        
                        {order.status === 'processing' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="status-btn delivered-btn"
                          >
                            <Package className="w-4 h-4" />
                            Mark Delivered
                          </button>
                        )}
                        
                        {order.status === 'delivered' && (
                          <div className="delivered-tag">
                            <CheckCircle className="w-4 h-4" />
                            Completed
                          </div>
                        )}
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
                    {cat.emoji} {cat.nameEn} ({count})
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
                  placeholder="Icon (emoji)"
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
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
                    {category.icon}
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
                  placeholder="Icon (emoji)"
                  value={subcategoryFormData.icon}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, icon: e.target.value })}
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
                      {subcategory.icon || '📦'}
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
      </div>
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
              <span className="modal-label">Order Date</span>
              <span className="modal-value">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="modal-info-row">
              <span className="modal-label">Status</span>
              <span className="modal-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>

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

// --- PROFILE VIEW ---
const ProfileView = ({ userProfile, orders, onLogout, language, setCurrentView }) => {
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
        <p className="profile-id">User ID: {userProfile?.userId?.slice(0, 8)}</p>
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
  const [notification, setNotification] = useState(null);
  const [previousOrderStatuses, setPreviousOrderStatuses] = useState({});
  const [isShopkeeperMode, setIsShopkeeperMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [subcategoriesData, setSubcategoriesData] = useState([]);

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

    console.log('[Auth] Signing in anonymously for local development...');
    signInAnonymously(auth).catch(err => console.error('[Auth] Sign-in error:', err));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Auth] User authenticated:', firebaseUser.uid);
        setUser(firebaseUser);
      } else {
        console.log('[Auth] No user authenticated');
        setUser(null);
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

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
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

  const handleCheckout = useCallback(async () => {
    if (Object.keys(cartItems).length === 0) return;

    const items = Object.values(cartItems);
    const total = items.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0);

    const orderData = {
      userId: user.uid,
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
      createdAt: new Date().toISOString()
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
  }, [cartItems, user]);

  const handleLogout = useCallback(() => {
    setCartItems({});
    setOrders([]);
    setCurrentView('Home');
    window.location.reload();
  }, []);

  if (loading || !user) {
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

  return (
    <div className="app-container-modern">
      <AppHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        language={language}
        toggleLanguage={toggleLanguage}
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
            userProfile={{ userId: user?.uid }}
            orders={orders}
            onLogout={handleLogout}
            language={language}
            setCurrentView={setCurrentView}
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
    </div>
  );
}

export default App;
