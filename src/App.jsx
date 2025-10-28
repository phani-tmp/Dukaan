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
