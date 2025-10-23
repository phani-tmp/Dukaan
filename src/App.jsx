import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseConfig, localAppId } from './firebaseConfig.js';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, getDoc, updateDoc, where, addDoc } from 'firebase/firestore';

// Icon Imports 
import { Search, MapPin, ShoppingCart, User, Home, Package, ChevronLeft, Minus, Plus, IndianRupee, Mic, LogOut, CheckCircle, Clock, ShoppingBag, Truck, Check, X } from 'lucide-react';

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
    delivered: 'Delivered'
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
    delivered: 'డెలివరీ అయ్యింది'
  }
};

// --- CATEGORY DATA WITH BILINGUAL LABELS ---
const categories = [
  { id: 'groceries', nameEn: 'Groceries', nameTe: 'వీరగాణ', icon: '🏪', color: '#4CAF50' },
  { id: 'vegetables', nameEn: 'Vegetables', nameTe: 'కూరగాయలు', icon: '🥬', color: '#8BC34A' },
  { id: 'milk', nameEn: 'Milk', nameTe: 'పాలు', icon: '🥛', color: '#5DADE2' },
  { id: 'snacks', nameEn: 'Snacks', nameTe: 'స్నాక్స్', icon: '🍿', color: '#FF9800' },
  { id: 'medicines', nameEn: 'Medicines', nameTe: 'మందులు', icon: '💊', color: '#2196F3' },
  { id: 'electronics', nameEn: 'Electronics', nameTe: 'ఎలక్ట్రానిక్స్', icon: '📱', color: '#9C27B0' }
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
const CategoryGrid = ({ setCurrentView, setSelectedCategory, language }) => {
  const t = translations[language];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentView('CategoryProducts');
  };

  return (
    <div className="category-section">
      <div className="category-grid">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className="category-card"
            style={{ backgroundColor: cat.color }}
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

// --- HOME VIEW ---
const HomeView = ({ products, onAddToCart, cartItems, setCurrentView, setSelectedCategory, searchTerm, language }) => {
  const t = translations[language];

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.category.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const popularProducts = filteredProducts.slice(0, 6);

  return (
    <div className="home-view">
      <CategoryGrid 
        setCurrentView={setCurrentView} 
        setSelectedCategory={setSelectedCategory}
        language={language}
      />

      <div className="popular-section">
        <h2 className="section-title">{t.popularProducts}</h2>
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
      </div>
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

// --- ORDERS VIEW ---
const OrdersView = ({ orders, setCurrentView, language }) => {
  const t = translations[language];

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" />
        <p className="empty-text">{t.noOrders}</p>
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
    if (status === 'delivered') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === 'processing') return <Truck className="w-5 h-5 text-blue-600" />;
    return <Clock className="w-5 h-5 text-orange-600" />;
  };

  return (
    <div className="orders-view">
      <h2 className="view-title">{t.myOrders}</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-status">
                {getStatusIcon(order.status)}
                <span>{getStatusText(order.status)}</span>
              </div>
              <span className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, idx) => (
                <p key={idx} className="order-item-text">
                  {item.name} x {item.quantity}
                </p>
              ))}
            </div>
            <div className="order-total">
              <IndianRupee className="w-4 h-4" />
              {order.total.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- PROFILE VIEW ---
const ProfileView = ({ userProfile, onLogout, language }) => {
  const t = translations[language];

  return (
    <div className="profile-view">
      <h2 className="view-title">{t.profile}</h2>
      <div className="profile-info">
        <div className="profile-avatar">
          <User className="w-12 h-12" />
        </div>
        <p className="profile-id">User ID: {userProfile?.userId?.slice(0, 8)}</p>
      </div>
      <button onClick={onLogout} className="logout-button">
        <LogOut className="w-5 h-5" />
        {t.logout}
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('Ponnur, AP');

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

  // Load user orders
  useEffect(() => {
    if (!user) return;

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
  }, [user]);

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
        quantity: item.quantity
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
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            language={language}
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
          />
        )}

        {currentView === 'Profile' && (
          <ProfileView
            userProfile={{ userId: user?.uid }}
            onLogout={handleLogout}
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
    </div>
  );
}

export default App;
