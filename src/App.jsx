import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseConfig, localAppId } from './firebaseConfig.js';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, getDoc, updateDoc, where, addDoc, deleteDoc, getDocs } from 'firebase/firestore';

// Icon Imports 
import { Search, MapPin, ShoppingCart, User, Home, Package, ChevronLeft, Minus, Plus, IndianRupee, Mic, LogOut, CheckCircle, Clock, ShoppingBag, Truck, Check, X, Settings, PlusCircle, Edit, Trash2, Save, Image as ImageIcon, Upload, Star, Phone, Eye, XCircle } from 'lucide-react';

// Shared Component Imports
import LoadingSpinner from './components/shared/LoadingSpinner';
import ToastNotification from './components/shared/ToastNotification';
import AppHeader from './components/shared/AppHeader';
import BottomNavigation from './components/shared/BottomNavigation';
import OrderDetailsModal from './components/shared/OrderDetailsModal';

// Customer Feature Components
import HomeView from './features/customer/HomeView';
import CartView from './features/customer/CartView';
import OrdersView from './features/customer/OrdersView';
import ProfileView from './features/customer/ProfileView';

// Auth Feature Components
import PhoneLoginUI from './features/auth/PhoneLoginUI';
import ProfileSetupModal from './features/auth/ProfileSetupModal';

// Address Feature Components
import AddressManager from './features/address/AddressManager';
import AddressForm from './features/address/AddressForm';

// Shopkeeper Feature Components
import ShopkeeperDashboard from './features/shopkeeper/ShopkeeperDashboard';
import UsersManagement from './features/shopkeeper/UsersManagement';

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

// ShopkeeperDashboard component has been extracted to src/features/shopkeeper/ShopkeeperDashboard.jsx
// UsersManagement component has been extracted to src/features/shopkeeper/UsersManagement.jsx

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
