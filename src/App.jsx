


import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Fix: Use correct import structure for local environment
import { firebaseConfig, localAppId } from './firebaseConfig.js';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, onSnapshot, getDoc, updateDoc, where } from 'firebase/firestore';

// Icon Imports 
import { Search, MapPin, ShoppingCart, User, Home, Package, ChevronLeft, Minus, Plus, IndianRupee, Mic, Store, LogOut, CheckCircle, Clock, ShoppingBag, Truck, Check, X } from 'lucide-react';

// --- FIREBASE UTILITIES & CONFIGURATION ---

// Use imported local config values
const appId = localAppId;
const fireConfig = firebaseConfig;

let app, db, auth;

// Helper to sanitize store data for public consumption
const sanitizeProduct = (product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  discountedPrice: product.discountedPrice || null,
  weight: product.weight,
  storeId: product.storeId,
  imageUrl: product.imageUrl,
  category: product.category
});


// --- 1. SHARED COMPONENTS (Loading, Icons, Footer) ---

const LoadingSpinner = () => (
  <div className="flex-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'transparent', borderBottomColor: 'var(--color-green-700)' }}></div>
    <p className="ml-3" style={{ color: 'var(--color-green-700)', fontWeight: 500 }}>Loading Dukaan data...</p>
  </div>
);

const CartIcon = ({ cartItems, setCurrentView }) => {
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = Object.values(cartItems).reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0);

  if (totalItems === 0) return null;

  return (
    <div className="cart-icon-bar">
      <button
        onClick={() => setCurrentView('Cart')}
        className="cart-icon-button"
      >
        <span style={{ fontWeight: 600, fontSize: '0.875rem', padding: '2px 8px', backgroundColor: 'var(--color-green-800)', borderRadius: '9999px' }}>
          {totalItems} Items
        </span>
        <span style={{ fontWeight: 700, fontSize: '1.125rem', display: 'flex', alignItems: 'center' }}>
          <IndianRupee className="w-4 h-4 mr-1" style={{ width: '16px', height: '16px', marginRight: '4px' }} />
          {totalCost.toFixed(0)}
        </span>
        <span style={{ fontWeight: 600 }}>
          View Cart
        </span>
      </button>
    </div>
  );
};

const AppFooter = ({ currentView, setCurrentView, cartItems, isShopkeeper, newOrderCount }) => {
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  const navItems = isShopkeeper ?
    [
      { name: 'Dashboard', icon: Store, view: 'ShopDashboard' },
      { name: 'Orders', icon: Package, view: 'ShopOrders', badge: newOrderCount },
      { name: 'Profile', icon: User, view: 'Profile' },
    ]
    :
    [
      { name: 'Home', icon: Home, view: 'Home' },
      { name: 'Orders', icon: Package, view: 'ConsumerOrders' },
      { name: 'Cart', icon: ShoppingCart, view: 'Cart', badge: totalItems },
      { name: 'Profile', icon: User, view: 'Profile' },
    ];

  return (
    <div className="app-footer">
      <div className="flex-between h-16" style={{ maxWidth: '500px', margin: '0 auto' }}>
        {navItems.map(item => (
          <button
            key={item.name}
            onClick={() => setCurrentView(item.view)}
            className={`nav-item ${currentView === item.view || (item.view === 'ShopDashboard' && currentView === 'ShopDashboard') ? 'nav-item-active' : ''}`}
          >
            <item.icon className="w-6 h-6" />
            {item.name}
            {item.badge > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', backgroundColor: 'var(--color-red-600)', color: 'white', fontSize: '0.75rem', fontWeight: 700, borderRadius: '9999px', height: '16px', width: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};


// --- ROLE SELECTION VIEW ---

const RoleSelectionView = ({ userId, setIsShopkeeper, setUserRoleDefined }) => {

  const setRole = useCallback(async (isProvider) => {
    try {
      const userProfileRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
      // Ensure the profile document exists before updating
      await setDoc(userProfileRef, { isShopkeeper: isProvider, lastLogin: new Date().toISOString() }, { merge: true });

      setIsShopkeeper(isProvider);
      setUserRoleDefined(true);
      console.log(`[Role] User set as ${isProvider ? 'Shopkeeper' : 'Consumer'}.`);
    } catch (error) {
      console.error("Error setting role:", error);
      // Fallback: allow them to proceed as consumer if update fails
      setIsShopkeeper(false);
      setUserRoleDefined(true);
    }
  }, [userId, setIsShopkeeper, setUserRoleDefined]);

  return (
    <div className="card p-6" style={{ maxWidth: '400px', margin: '40px auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-green-700)', marginBottom: '24px', textAlign: 'center' }}>
        Welcome to Dukaan!
      </h2>
      <p style={{ color: '#4b5563', marginBottom: '32px', textAlign: 'center' }}>
        Are you here to shop locally or to register your store?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button
          onClick={() => setRole(false)}
          className="btn-primary"
          style={{ backgroundColor: '#2563eb', padding: '14px 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ShoppingBag className="w-6 h-6 mr-3" style={{ width: '24px', height: '24px', marginRight: '12px' }} /> I am a **Buyer** (Customer)
        </button>
        <button
          onClick={() => setRole(true)}
          className="btn-primary"
          style={{ padding: '14px 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Store className="w-6 h-6 mr-3" style={{ width: '24px', height: '24px', marginRight: '12px' }} /> I am a **Provider** (Shopkeeper)
        </button>
      </div>
      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
        You can change this role later in your profile.
      </p>
    </div>
  );
};


// --- 2. SHOPKEEPER DASHBOARD, REGISTRATION, & ORDER MANAGEMENT ---

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return '#dc2626'; // Red
    case 'Preparing': return '#f59e0b'; // Amber/Orange
    case 'Ready': return '#2563eb'; // Blue
    case 'Delivered': return '#059669'; // Green
    default: return '#6b7280';
  }
};

// Order Management View for Shopkeeper
const ShopOrdersView = ({ shopOrders, linkedStoreId, setCurrentView }) => {
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus, updatedAt: new Date().toISOString() });
      console.log(`Order ${orderId} status updated to ${newStatus}.`);
    } catch (e) {
      console.error("Error updating order status:", e);
    }
  }, []);

  const ordersToDisplay = shopOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px', margin: '0 auto', paddingBottom: '80px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-800)' }}>Incoming Orders</h2>

      {ordersToDisplay.length === 0 ? (
        <div className="card p-6" style={{ textAlign: 'center', border: '1px dashed var(--color-gray-300)' }}>
          <Package style={{ width: '32px', height: '32px', color: '#9ca3af', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>No pending orders for your store!</p>
        </div>
      ) : (
        ordersToDisplay.map(order => (
          <div key={order.id} className="card" style={{ padding: '16px', borderLeft: `6px solid ${getStatusColor(order.status)}` }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Order #{order.orderId || order.id.substring(0, 6).toUpperCase()}</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}><IndianRupee className="w-4 h-4 mr-1" />{order.total.toFixed(0)}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Customer ID: {order.buyerId.substring(0, 8)}...</p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <Clock style={{ width: '16px', height: '16px', marginRight: '8px', color: getStatusColor(order.status) }} />
              <span style={{ fontWeight: 700, color: getStatusColor(order.status) }}>Status: {order.status}</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>Items:</h4>
              <ul style={{ listStyle: 'none', paddingLeft: '0', fontSize: '0.875rem', color: '#4b5563', maxHeight: '60px', overflowY: 'auto' }}>
                {Object.values(order.items).map(item => (
                  <li key={item.id}>- {item.quantity}x {item.name.split('/')[0]}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-gray-100)', paddingTop: '12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {order.status === 'Pending' && (
                <button onClick={() => updateOrderStatus(order.id, 'Preparing')} className="btn-primary" style={{ backgroundColor: '#f59e0b', padding: '8px 12px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  Start Preparing
                </button>
              )}
              {order.status === 'Preparing' && (
                <button onClick={() => updateOrderStatus(order.id, 'Ready')} className="btn-primary" style={{ backgroundColor: '#2563eb', padding: '8px 12px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  Mark Ready for Pickup
                </button>
              )}
              {(order.status === 'Ready' || order.status === 'Preparing') && (
                <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="btn-primary" style={{ backgroundColor: 'var(--color-green-700)', padding: '8px 12px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};


const ShopkeeperDashboard = ({ userId, storeId, setStoreId, setLinkedStoreId, stores, shopOrders, newOrderCount }) => {
  const isRegistered = !!storeId;
  const store = stores.find(s => s.id === storeId);

  // State for New Store Registration Form
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isProductAdding, setIsProductAdding] = useState(false);

  // Function to Register New Store
  const handleRegisterStore = useCallback(async (e) => {
    e.preventDefault();
    if (!storeName || !storeLocation) {
      setMessage('Please enter a name and location.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      // 1. Create a new store document in the public collection
      const newStoreRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'stores'));
      const newStoreData = {
        id: newStoreRef.id,
        ownerId: userId,
        name: storeName,
        location: storeLocation,
        rating: 4.5, // Default rating
        reviews: 0,
        status: 'Open',
        createdAt: new Date().toISOString(),
        distance: '0 km', // Shopkeeper is at the store
        delivery: '5 min'
      };
      await setDoc(newStoreRef, newStoreData);

      // 2. Update the user's private profile to link the new store
      const userProfileRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
      await updateDoc(userProfileRef, {
        isShopkeeper: true,
        linkedStoreId: newStoreRef.id
      });

      setStoreId(newStoreRef.id);
      setLinkedStoreId(newStoreRef.id);
      setMessage('Store registered successfully! You are now live.');
    } catch (error) {
      console.error("Error registering store:", error);
      setMessage(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [storeName, storeLocation, userId, setStoreId, setLinkedStoreId]);

  // --- Product Adding Form with Image Handling ---
  const ProductAddingForm = () => {
    const [pName, setPName] = useState('');
    const [pPrice, setPPrice] = useState(0);
    const [pCat, setPCat] = useState('Groceries');
    const [pWeight, setPWeight] = useState('1 Kg');
    const [pImageFile, setPImageFile] = useState(null);
    const [pLoading, setPLoading] = useState(false);
    const [pMessage, setPMessage] = useState('');

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check if file size exceeds 100KB (a reasonable limit for Base64 storage in Firestore)
        if (file.size > 1024 * 100) {
          setPMessage('Warning: Image size is too large (>100KB). Please select a smaller image or use Firebase Storage in production.');
        }
        setPImageFile(file);
      } else {
        setPImageFile(null);
      }
    };

    const handleAddProduct = async (e) => {
      e.preventDefault();
      if (!pName || !pPrice || parseFloat(pPrice) <= 0 || !storeId) {
        setPMessage('Please fill in product name and a valid price.');
        return;
      }
      setPLoading(true);
      setPMessage('');

      try {
        let imageUrl = `https://placehold.co/60x80/fef3c7/000?text=${pName.substring(0, 4)}`;

        if (pImageFile) {
          // Simulating image upload by converting to a Base64 Data URL
          imageUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(pImageFile);
          });
        }

        const productRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
        const newProduct = sanitizeProduct({
          id: productRef.id,
          name: pName,
          price: parseFloat(pPrice),
          discountedPrice: null,
          weight: pWeight,
          storeId: storeId,
          imageUrl: imageUrl, // Use the Base64 or placeholder URL
          category: pCat
        });
        await setDoc(productRef, newProduct);
        setPMessage('Product added successfully!');
        setPName('');
        setPPrice(0);
        setPImageFile(null);
      } catch (error) {
        console.error("Error adding product:", error);
        setPMessage(`Failed to add product: ${error.message}`);
      } finally {
        setPLoading(false);
      }
    };

    return (
      <div className="card p-4" style={{ border: '1px solid var(--color-gray-200)', padding: '16px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-green-700)', marginBottom: '16px' }}>Add New Product</h3>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Product Name (e.g., Basmati Rice)" value={pName} onChange={(e) => setPName(e.target.value)}
            className="input-field" />
          <input type="number" placeholder="Price (₹)" value={pPrice} onChange={(e) => setPPrice(e.target.value)}
            className="input-field" />
          <select value={pCat} onChange={(e) => setPCat(e.target.value)} className="input-field">
            <option>Groceries</option>
            <option>Vegetables</option>
            <option>Snacks</option>
            <option>Dairy</option>
            <option>Household</option>
          </select>

          <div style={{ border: '1px solid var(--color-gray-200)', padding: '8px', borderRadius: '8px' }}>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ padding: '8px 0', width: '100%', border: 'none', background: 'none' }} />
            <p style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '4px' }}>
              {pImageFile ? `Image selected: ${pImageFile.name}` : 'Upload/Take Photo of Product'}
            </p>
          </div>

          <button type="submit" disabled={pLoading} className="btn-primary" style={{ backgroundColor: '#16a34a' }}>
            {pLoading ? 'Adding...' : 'Save Product & Go Live'}
          </button>
        </form>
        {pMessage && <p style={{ marginTop: '12px', fontSize: '0.875rem', color: pMessage.includes('success') ? '#16a34a' : 'var(--color-red-600)' }}>{pMessage}</p>}
      </div>
    );
  };

  if (!isRegistered) {
    return (
      <div className="card p-6" style={{ maxWidth: '500px', margin: '40px auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-green-700)', marginBottom: '16px', display: 'flex', alignItems: 'center' }}><Store className="w-6 h-6 mr-2" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> Register Your Kirana Store</h2>
        <p style={{ color: '#4b5563', marginBottom: '24px' }}>Start selling locally! Fill in your details to get your Dukaan live. User ID: {userId}</p>

        <form onSubmit={handleRegisterStore} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Store Name (e.g., Srinivasa Kirana)" value={storeName} onChange={(e) => setStoreName(e.target.value)}
            className="input-field" />
          <input type="text" placeholder="Location/Address (e.g., Ponnur, AP)" value={storeLocation} onChange={(e) => setStoreLocation(e.target.value)}
            className="input-field" />
          <button type="submit" disabled={loading} className="btn-primary" style={{ fontSize: '1.125rem' }}>
            {loading ? 'Registering...' : 'Go Live!'}
          </button>
        </form>
        {message && <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.875rem', color: message.includes('success') ? 'var(--color-green-600)' : 'var(--color-red-600)' }}>{message}</p>}
      </div>
    );
  }

  // Registered Shopkeeper Dashboard
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px', margin: '0 auto', paddingBottom: '80px' }}>
      <div style={{ backgroundColor: 'var(--color-green-700)', color: 'white', padding: '16px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center' }}>
          <Store className="w-6 h-6 mr-2" style={{ width: '24px', height: '24px', marginRight: '8px' }} /> {store?.name || 'Your Dukaan'}
        </h2>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '4px' }}>Status: {store?.status || 'Loading...'}</p>
        <p style={{ fontSize: '0.75rem' }}>{store?.location}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div className="card p-4" style={{ padding: '16px', border: '1px solid var(--color-gray-100)' }}>
          <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-red-600)' }}>{newOrderCount}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>New Orders</p>
        </div>
        <div className="card p-4" style={{ padding: '16px', border: '1px solid var(--color-gray-100)' }}>
          <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-gray-800)' }}>{stores.find(s => s.id === storeId)?.productCount || 0}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Products</p>
        </div>
      </div>

      <button
        onClick={() => setIsProductAdding(!isProductAdding)}
        className="btn-primary" style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}
      >
        {isProductAdding ? 'Hide Product Management' : <><Plus className="w-5 h-5 mr-2" style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Manage Products & Inventory</>}
      </button>
      {isProductAdding && <ProductAddingForm />}

      <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-gray-800)', paddingTop: '8px' }}>Store Orders</h3>
      <ShopOrdersView shopOrders={shopOrders} linkedStoreId={storeId} />
    </div>
  );
};


// --- 3. CONSUMER INTERFACE COMPONENTS (Home, Store, Cart, Orders) ---

// Helper to find all products for a given store
const getProductsByStore = (products, storeId) => {
  return products.filter(p => p.storeId === storeId);
};

const StoreCard = ({ store, setCurrentView, setSelectedStore }) => (
  <div className="store-card" style={{ transition: 'box-shadow 0.3s' }}>
    <div className="store-card-header" style={{ backgroundImage: `url(https://placehold.co/300x100/f0fdf4/15803d?text=${store.name.split('/')[0].trim().replace(/\s/g, '+')})`, height: '100px', borderBottom: '1px solid var(--color-gray-100)' }}>
    </div>
    <div style={{ padding: '12px' }}>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</h3>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', marginTop: '4px', marginBottom: '8px' }}>
        <span style={{ color: '#f59e0b', marginRight: '4px' }}>★ {store.rating}</span>
        <span style={{ color: '#6b7280' }}>({store.reviews}+)</span>
      </div>
      <div className="flex-between" style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Truck className="w-4 h-4 mr-1" style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--color-green-700)' }} />
          <span style={{ color: 'var(--color-green-700)', fontWeight: 500 }}>{store.distance || 'N/A'} | {store.delivery || '30 min'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#d1fae5', color: 'var(--color-green-800)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>FREE DELIVERY</span>
        </div>
      </div>
      <button
        onClick={() => { setSelectedStore(store); setCurrentView('Store'); }}
        className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.875rem' }}
      >
        View Store
      </button>
    </div>
  </div>
);

const HomeView = ({ setCurrentView, setSelectedStore, stores }) => (
  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* Banner Section */}
    <div style={{ position: 'relative', height: '128px', backgroundColor: '#fffbe7', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
      <img src={`uploaded:Gemini_Generated_Image_meg8gqmeg8gqmeg8.jpg`} alt="Fresh Mangos Arrived!" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} onError={(e) => e.target.style.display = 'none'} />
      <div style={{ zIndex: 10, color: 'var(--color-green-800)', fontWeight: 800, fontSize: '1.5rem' }}>
        Fresh Mangos<br />Arrived!
      </div>
      <div style={{ zIndex: 10, backgroundColor: 'var(--color-red-600)', color: 'white', padding: '8px', borderRadius: '8px', fontWeight: 700, boxShadow: 'var(--shadow-lg)' }}>
        Diwali<br />Special Offers!
      </div>
    </div>

    {/* Local Favorites Section */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-gray-800)' }}>Local Favorites ({stores.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {stores.length > 0 ? (
          stores.map(store => (
            <StoreCard key={store.id} store={store} setCurrentView={setCurrentView} setSelectedStore={setSelectedStore} />
          ))
        ) : (
          <p style={{ color: '#6b7280', padding: '24px', textAlign: 'center', border: '1px dashed var(--color-gray-300)', borderRadius: '8px' }}>No local stores registered yet. Be the first shopkeeper!</p>
        )}
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, addToCart }) => {
  const isDiscounted = product.discountedPrice && product.discountedPrice < product.price;
  const displayPrice = isDiscounted ? product.discountedPrice : product.price;

  return (
    <div className="product-card">
      <img src={product.imageUrl} alt={product.name.split('/')[0]} style={{ width: '64px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-gray-100)' }} onError={(e) => e.target.src = 'https://placehold.co/60x80/fef3c7/000?text=PROD'} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
        <div>
          <h4 style={{ fontWeight: 500, color: 'var(--color-gray-800)', fontSize: '0.875rem', lineHeight: '1.25' }}>{product.name.split('/')[0]}</h4>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{product.weight}</p>
        </div>
        <div className="product-card-controls">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--color-green-700)' }}>
              <IndianRupee style={{ width: '12px', height: '12px', marginRight: '2px' }} />
              {displayPrice.toFixed(0)}
            </span>
            {isDiscounted && (
              <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                <IndianRupee style={{ width: '12px', height: '12px', marginRight: '2px' }} />
                {product.price.toFixed(0)}
              </span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="product-card-add-btn"
          >
            <Plus style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StoreDetailView = ({ store, setCurrentView, cartItems, setCartItems, authReady, userId, products }) => {
  // Only show products belonging to the selected store
  const storeProducts = useMemo(() => getProductsByStore(products, store.id), [products, store.id]);

  const productsByCategory = useMemo(() => {
    return storeProducts.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {});
  }, [storeProducts]);

  const allCategories = Object.keys(productsByCategory);
  const [activeCategory, setActiveCategory] = useState(allCategories[0] || 'All');

  const addToCart = useCallback((product) => {
    const price = product.discountedPrice || product.price;
    const storeId = product.storeId;

    setCartItems(prev => {
      // Simple check: Ensure all cart items are from the same store.
      const existingItems = Object.values(prev);
      if (existingItems.length > 0 && existingItems[0].storeId !== storeId) {
        console.log("Cannot add item: Cart must contain items from only one store.");
        // In a real app, you'd show a modal asking the user to clear their cart.
        return prev;
      }

      const currentItem = prev[product.id];
      const newQuantity = currentItem ? currentItem.quantity + 1 : 1;
      const updatedCart = {
        ...prev,
        [product.id]: {
          ...sanitizeProduct(product),
          price: price,
          quantity: newQuantity,
        }
      };
      if (authReady) {
        const cartRef = doc(db, 'artifacts', appId, 'users', userId, 'cart', product.id);
        setDoc(cartRef, { ...sanitizeProduct(product), price: price, quantity: newQuantity }, { merge: true }).catch(console.error);
      }
      return updatedCart;
    });
  }, [setCartItems, authReady, userId]);


  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header/Back Button */}
      <div className="app-header flex-between" style={{ padding: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={() => setCurrentView('Home')} style={{ color: '#4b5563', border: 'none', background: 'none', cursor: 'pointer', marginRight: '12px' }}>
          <ChevronLeft style={{ width: '24px', height: '24px' }} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name.split('/')[0]}</h2>
      </div>

      {/* Store Information */}
      <div className="store-info-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={`https://placehold.co/100x100/15803d/ffffff?text=${store.name.substring(0, 2)}`} alt={store.name} style={{ width: '64px', height: '64px', borderRadius: '9999px', objectFit: 'cover', border: '2px solid var(--color-green-700)' }} />
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--color-green-800)' }}>{store.name.split('/')[0]}</h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{store.location} | Est. {store.delivery || '30 min'} delivery</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {allCategories.length > 0 && (
        <div className="category-tabs-container">
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`category-tab ${activeCategory === category ? 'category-tab-active' : 'category-tab-inactive'}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Product List */}
      <div style={{ flexGrow: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-gray-800)' }}>{activeCategory}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {productsByCategory[activeCategory]?.map(product => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
        {storeProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'var(--color-gray-100)', borderRadius: '12px' }}>
            <p style={{ color: '#4b5563' }}>This store has not added any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Cart Components (CartItem and CartView)
const CartItem = ({ item, updateCartQuantity }) => {
  const totalCost = item.price * item.quantity;
  return (
    <div className="cart-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={item.imageUrl} alt={item.name.split('/')[0]} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => e.target.src = 'https://placehold.co/48x48/fef3c7/000?text=I'} />
        <div>
          <p style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-gray-800)', lineHeight: '1.25' }}>{item.name.split('/')[0]}</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.weight}</p>
          <p style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', color: 'var(--color-green-700)', marginTop: '4px' }}>
            <IndianRupee style={{ width: '12px', height: '12px', marginRight: '2px' }} />
            {totalCost.toFixed(0)}
          </p>
        </div>
      </div>
      <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => updateCartQuantity(item.id, -1)} className="minus">
          <Minus style={{ width: '16px', height: '16px' }} />
        </button>
        <span style={{ fontWeight: 600, width: '16px', textAlign: 'center' }}>{item.quantity}</span>
        <button onClick={() => updateCartQuantity(item.id, 1)} className="plus">
          <Plus style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
};

const CartView = ({ cartItems, setCartItems, authReady, userId, setCurrentView }) => {
  const itemsArray = useMemo(() => Object.values(cartItems), [cartItems]);
  const subtotal = itemsArray.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const grandTotal = subtotal + deliveryFee;

  const updateCartQuantity = useCallback(async (productId, change) => {
    const item = cartItems[productId];
    if (!item) return;

    const newQuantity = item.quantity + change;
    const cartRef = doc(db, 'artifacts', appId, 'users', userId, 'cart', productId);

    if (newQuantity <= 0) {
      setCartItems(prev => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
      // Setting quantity to 0 marks it for deletion/removal
      if (authReady) await setDoc(cartRef, { quantity: 0 }, { merge: true });
    } else {
      setCartItems(prev => ({
        ...prev,
        [productId]: { ...item, quantity: newQuantity }
      }));
      if (authReady) await updateDoc(cartRef, { quantity: newQuantity });
    }

  }, [cartItems, authReady, userId, setCartItems]);

  // Checkout and Order Placement
  const handleCheckout = async () => {
    if (itemsArray.length === 0) return;

    const storeId = itemsArray[0].storeId; // Assume all items are from the same store

    try {
      // 1. Create a new order document in the public collection
      const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
      const newOrder = {
        id: orderRef.id,
        orderId: Math.floor(10000 + Math.random() * 90000).toString(), // Mock ID
        storeId: storeId,
        buyerId: userId,
        items: itemsArray,
        subtotal: subtotal,
        total: grandTotal,
        status: 'Pending', // Initial status
        createdAt: new Date().toISOString(),
      };
      await setDoc(orderRef, newOrder);

      // 2. Clear the user's cart in Firestore
      const clearCartPromises = itemsArray.map(item =>
        setDoc(doc(db, 'artifacts', appId, 'users', userId, 'cart', item.id), { quantity: 0 }, { merge: true })
      );
      await Promise.all(clearCartPromises);

      // 3. Update local state and view
      setCartItems({});
      console.log('Order Placed Successfully! (Real Order ID:', newOrder.orderId, ")");
      setCurrentView('ConsumerOrders');
    } catch (e) {
      console.error("Error during checkout:", e);
      // In a real app, show a proper error modal
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '128px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '16px' }}>Cart & Checkout / కార్ట్ & పికనివుల్</h2>

      {itemsArray.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', border: '1px solid var(--color-gray-100)' }}>
          <ShoppingCart style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '1.125rem', color: '#4b5563' }}>Your cart is empty.</p>
          <button onClick={() => setCurrentView('Home')} style={{ marginTop: '16px', color: 'var(--color-green-700)', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {itemsArray.map(item => (
              <CartItem key={item.id} item={item} updateCartQuantity={updateCartQuantity} />
            ))}
          </div>

          {/* Order Summary */}
          <div className="card p-4" style={{ padding: '16px', border: '1px solid var(--color-gray-100)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', marginBottom: '8px' }}>Order Summary</h3>
            <div className="flex-between" style={{ color: '#4b5563' }}>
              <span>Subtotal:</span>
              <span style={{ display: 'flex', alignItems: 'center' }}><IndianRupee style={{ width: '12px', height: '12px', marginRight: '4px' }} />{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex-between" style={{ color: '#4b5563' }}>
              <span>Delivery Fee:</span>
              <span style={{ display: 'flex', alignItems: 'center' }}><IndianRupee style={{ width: '12px', height: '12px', marginRight: '4px' }} />{deliveryFee.toFixed(0)}</span>
            </div>
            <div className="flex-between" style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-green-700)', paddingTop: '8px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
              <span>Grand Total:</span>
              <span style={{ display: 'flex', alignItems: 'center' }}><IndianRupee style={{ width: '16px', height: '16px', marginRight: '4px' }} />{grandTotal.toFixed(0)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button onClick={handleCheckout} className="btn-primary" style={{ padding: '12px 0', fontSize: '1.125rem', boxShadow: '0 10px 15px -3px rgba(4, 120, 87, 0.3)' }}>
            Proceed to Pay / పే చేయడానికి కొనసాగండి
          </button>
        </>
      )}
    </div>
  );
};

// Consumer Order History View
const ConsumerOrdersView = ({ userId, allOrders, stores }) => {
  const userOrders = useMemo(() => {
    return allOrders
      .filter(order => order.buyerId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allOrders, userId]);

  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name.split('/')[0] || 'Unknown Store';

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px', margin: '0 auto', paddingBottom: '80px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-800)' }}>Your Orders / మీ ఆర్డర్లు</h2>

      {userOrders.length === 0 ? (
        <div className="card p-6" style={{ textAlign: 'center', border: '1px dashed var(--color-gray-300)' }}>
          <Package style={{ width: '32px', height: '32px', color: '#9ca3af', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600 }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        userOrders.map(order => (
          <div key={order.id} className="card" style={{ padding: '16px', borderLeft: `6px solid ${getStatusColor(order.status)}` }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--color-gray-100)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Order #{order.orderId || order.id.substring(0, 6).toUpperCase()}</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center' }}><IndianRupee className="w-4 h-4 mr-1" />{order.total.toFixed(0)}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Store: <span style={{ fontWeight: 600 }}>{getStoreName(order.storeId)}</span></p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <Clock style={{ width: '16px', height: '16px', marginRight: '8px', color: getStatusColor(order.status) }} />
              <span style={{ fontWeight: 700, color: getStatusColor(order.status) }}>Status: {order.status}</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>Items:</h4>
              <ul style={{ listStyle: 'none', paddingLeft: '0', fontSize: '0.875rem', color: '#4b5563', maxHeight: '60px', overflowY: 'auto' }}>
                {Object.values(order.items).map(item => (
                  <li key={item.id}>- {item.quantity}x {item.name.split('/')[0]}</li>
                ))}
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};


const ConsumerApp = ({ currentView, setCurrentView, selectedStore, setSelectedStore, cartItems, setCartItems, authReady, userId, stores, products, allOrders }) => {
  let content;
  switch (currentView) {
    case 'Home':
      content = <HomeView setCurrentView={setCurrentView} setSelectedStore={setSelectedStore} stores={stores} />;
      break;
    case 'Store':
      content = <StoreDetailView store={selectedStore} setCurrentView={setCurrentView} cartItems={cartItems} setCartItems={setCartItems} authReady={authReady} userId={userId} products={products} />;
      break;
    case 'Cart':
      content = <CartView cartItems={cartItems} setCartItems={setCartItems} authReady={authReady} userId={userId} setCurrentView={setCurrentView} />;
      break;
    case 'ConsumerOrders':
      content = <ConsumerOrdersView userId={userId} allOrders={allOrders} stores={stores} />;
      break;
    case 'Profile':
      const userProfileRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
      const handleSwitchToShopkeeper = async () => {
        await updateDoc(userProfileRef, { isShopkeeper: true, linkedStoreId: null });
        window.location.reload(); // Quick refresh to force role re-check
      }
      content = (
        <div className="card" style={{ padding: '32px', maxWidth: '500px', margin: '16px auto', textAlign: 'center', border: '1px solid var(--color-gray-100)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '16px' }}>User Profile (Buyer)</h2>
          <p style={{ color: '#4b5563', marginBottom: '16px' }}>User ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-green-700)' }}>{userId || 'Loading...'}</span></p>
          <button
            onClick={handleSwitchToShopkeeper}
            className="btn-primary" style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto', padding: '8px 16px' }}
          >
            <Store style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Switch to Shopkeeper Account
          </button>
          <button
            onClick={() => signOut(auth)}
            className="btn-primary" style={{ backgroundColor: 'var(--color-red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', padding: '8px 16px' }}
          >
            <LogOut style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Sign Out
          </button>
        </div>
      );
      break;
    default:
      content = <HomeView setCurrentView={setCurrentView} setSelectedStore={setSelectedStore} stores={stores} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)', display: 'flex', flexDirection: 'column' }}>
      {currentView !== 'Store' && <AppHeader setCurrentView={setCurrentView} currentView={currentView} />}
      <main style={{ flexGrow: 1, paddingBottom: '80px' }}>
        {content}
      </main>
      <CartIcon cartItems={cartItems} setCurrentView={setCurrentView} />
      <AppFooter currentView={currentView} setCurrentView={setCurrentView} cartItems={cartItems} userId={userId} />
    </div>
  );
};

const AppHeader = ({ setCurrentView, currentView }) => (
  <div className="app-header">
    <div className="flex-between" style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-green-700)', fontWeight: 600, fontSize: '0.875rem' }}>
        <MapPin style={{ width: '16px', height: '16px', marginRight: '4px' }} />
        Ponnur, AP / పెనుమాక, ఆంధ్రప్రదేశ్
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
        EN / తెలుగు
      </div>
    </div>
    {(currentView === 'Home' || currentView === 'ShopDashboard' || currentView === 'ShopOrders') && (
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-gray-100)', borderRadius: '12px', padding: '8px', border: '1px solid #e5e7eb' }}>
        <Search style={{ width: '20px', height: '20px', color: '#6b7280', margin: '0 8px' }} />
        <input
          type="text"
          placeholder="Search for groceries, services..."
          style={{ flexGrow: 1, backgroundColor: 'var(--color-gray-100)', color: 'var(--color-gray-800)', outline: 'none', placeholderColor: '#6b7280', border: 'none' }}
        />
        <Mic style={{ width: '20px', height: '20px', color: 'var(--color-green-700)', margin: '0 8px', cursor: 'pointer' }} title="Voice Search" />
      </div>
    )}
  </div>
);


// --- 5. MAIN APP COMPONENT (Router, State Management, Firebase Init) ---

const App = () => {
  const [currentView, setCurrentView] = useState('Home');
  const [selectedStore, setSelectedStore] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isShopkeeper, setIsShopkeeper] = useState(false);
  const [linkedStoreId, setLinkedStoreId] = useState(null);
  const [userRoleDefined, setUserRoleDefined] = useState(false);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  // --- FIREBASE INITIALIZATION AND AUTHENTICATION ---
  useEffect(() => {
    try {
      if (!app) {
        app = initializeApp(fireConfig);
        db = getFirestore(app);
        auth = getAuth(app);
      }

      const ensureAuth = async () => {
        if (!auth.currentUser) {
          console.log("[Auth] Signing in anonymously for local development...");
          await signInAnonymously(auth);
        }
      };

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserId(user.uid);
          const userProfileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');

          try {
            const profileSnap = await getDoc(userProfileRef);

            if (profileSnap.exists()) {
              const profileData = profileSnap.data();

              const roleSet = profileData.isShopkeeper !== undefined;

              if (roleSet) {
                setIsShopkeeper(profileData.isShopkeeper || false);
                setLinkedStoreId(profileData.linkedStoreId || null);
                setUserRoleDefined(true);
                if (profileData.isShopkeeper) {
                  setCurrentView('ShopDashboard');
                }
              } else {
                // Profile exists but role is not defined yet -> show selection screen
                setUserRoleDefined(false);
              }
            } else {
              // Brand new user -> show selection screen
              setUserRoleDefined(false);
              // Create initial profile document
              await setDoc(userProfileRef, { lastLogin: new Date().toISOString(), appId }, { merge: true });
            }
          } catch (error) {
            console.error("Error fetching/creating profile:", error);
            // Fallback to anonymous, but user will be prompted for role
            setUserRoleDefined(false);
          }

          setAuthReady(true);

        } else {
          ensureAuth().catch(error => console.error("Anonymous sign-in failed:", error));
        }
      });

      if (!auth.currentUser) {
        ensureAuth();
      }

      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization or auth error:", error);
    }
  }, []);

  // --- REAL-TIME PUBLIC DATA LISTENERS (Stores, Products, Orders) ---
  useEffect(() => {
    if (!authReady) return;

    const storesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'stores');
    const storesUnsubscribe = onSnapshot(query(storesCollectionRef), (snapshot) => {
      const newStores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setStores(newStores);
      if (!selectedStore && newStores.length > 0) {
        setSelectedStore(newStores[0]);
      }
      console.log(`[Firestore] Updated ${newStores.length} stores.`);
      setLoadingData(false);
    }, (error) => {
      console.error("Error listening to stores:", error);
    });

    const productsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const productsUnsubscribe = onSnapshot(query(productsCollectionRef), (snapshot) => {
      const newProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(newProducts);
      // Update product counts for stores
      const storeProductCounts = newProducts.reduce((acc, p) => {
        acc[p.storeId] = (acc[p.storeId] || 0) + 1;
        return acc;
      }, {});
      setStores(prevStores => prevStores.map(s => ({
        ...s,
        productCount: storeProductCounts[s.id] || 0
      })));

      console.log(`[Firestore] Updated ${newProducts.length} products.`);
    }, (error) => {
      console.error("Error listening to products:", error);
    });

    const ordersCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const ordersUnsubscribe = onSnapshot(query(ordersCollectionRef), (snapshot) => {
      const newOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllOrders(newOrders);
      console.log(`[Firestore] Updated ${newOrders.length} total orders.`);
    }, (error) => {
      console.error("Error listening to all orders:", error);
    });

    return () => {
      storesUnsubscribe();
      productsUnsubscribe();
      ordersUnsubscribe();
    };
  }, [authReady]);

  // --- REAL-TIME PRIVATE CART DATA LISTENER ---
  useEffect(() => {
    if (!authReady || !userId) return;

    const cartCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'cart');
    const unsubscribe = onSnapshot(query(cartCollectionRef), (snapshot) => {
      const newCartItems = {};
      snapshot.forEach((doc) => {
        const item = doc.data();
        // Only include items with quantity > 0
        if (item.quantity > 0) {
          newCartItems[item.id] = item;
        }
      });
      setCartItems(newCartItems);
      console.log(`[Firestore] Cart updated with ${Object.keys(newCartItems).length} items.`);
    }, (error) => {
      console.error("Error listening to cart changes:", error);
    });

    return () => unsubscribe();
  }, [authReady, userId]);

  // --- SHOPKEEPER ORDERS LISTENER ---
  useEffect(() => {
    if (!authReady || !isShopkeeper || !linkedStoreId) {
      setShopOrders([]);
      setNewOrderCount(0);
      return;
    }

    const ordersCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    // Filter orders specific to the linked store
    // NOTE: Firestore requires an index for queries using 'where', but we rely on a test mode rule 'if true'
    // For production, this query would be better: query(ordersCollectionRef, where('storeId', '==', linkedStoreId))
    const q = query(ordersCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const filteredOrders = allOrders.filter(o => o.storeId === linkedStoreId);

      setShopOrders(filteredOrders);
      const pendingCount = filteredOrders.filter(o => o.status === 'Pending').length;
      setNewOrderCount(pendingCount);
      console.log(`[Shopkeeper] Updated ${filteredOrders.length} orders. ${pendingCount} new.`);

    }, (error) => {
      console.error("Error listening to shop orders:", error);
    });

    return () => unsubscribe();
  }, [authReady, isShopkeeper, linkedStoreId]);

  // Initial loading state
  if (!authReady || loadingData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Role Selection Screen
  if (authReady && !userRoleDefined) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RoleSelectionView userId={userId} setIsShopkeeper={setIsShopkeeper} setUserRoleDefined={setUserRoleDefined} />
      </div>
    );
  }

  // --- MAIN ROUTING LOGIC ---

  if (isShopkeeper) {
    // Shopkeeper Interface
    let shopContent;
    switch (currentView) {
      case 'ShopDashboard':
      case 'Home': // Fallback to Dashboard if not set
        shopContent = (
          <ShopkeeperDashboard
            userId={userId}
            storeId={linkedStoreId}
            setStoreId={setLinkedStoreId}
            setLinkedStoreId={setIsShopkeeper}
            stores={stores}
            shopOrders={shopOrders}
            newOrderCount={newOrderCount}
          />
        );
        break;
      case 'ShopOrders':
        shopContent = <ShopOrdersView shopOrders={shopOrders} linkedStoreId={linkedStoreId} setCurrentView={setCurrentView} />;
        break;
      case 'Profile':
        const userProfileRef = doc(db, 'artifacts', appId, 'users', userId, 'profile', 'data');
        const handleSwitchToConsumer = async () => {
          await updateDoc(userProfileRef, { isShopkeeper: false });
          window.location.reload(); // Quick refresh to force role re-check
        }
        shopContent = (
          <div className="card" style={{ padding: '32px', maxWidth: '500px', margin: '16px auto', textAlign: 'center', border: '1px solid var(--color-gray-100)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '16px' }}>Shopkeeper Profile</h2>
            <p style={{ color: '#4b5563', marginBottom: '16px' }}>Store ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-green-700)' }}>{linkedStoreId || 'N/A'}</span></p>
            <p style={{ color: '#4b5563', marginBottom: '16px' }}>User ID: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-green-700)' }}>{userId || 'Loading...'}</span></p>
            <button
              onClick={handleSwitchToConsumer}
              className="btn-primary" style={{ backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto', padding: '8px 16px' }}
            >
              <ShoppingBag style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Switch to Buyer Account
            </button>
            <button
              onClick={() => signOut(auth)}
              className="btn-primary" style={{ backgroundColor: 'var(--color-red-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', padding: '8px 16px' }}
            >
              <LogOut style={{ width: '20px', height: '20px', marginRight: '8px' }} /> Sign Out
            </button>
          </div>
        );
        break;
      default:
        shopContent = <ShopkeeperDashboard userId={userId} storeId={linkedStoreId} setStoreId={setLinkedStoreId} setLinkedStoreId={setIsShopkeeper} stores={stores} shopOrders={shopOrders} newOrderCount={newOrderCount} />;
    }

    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '0.75rem', textAlign: 'center', padding: '4px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 600 }}>
          SHOPKEEPER VIEW | Store ID: {linkedStoreId || 'Not Registered'}
        </div>
        <AppHeader setCurrentView={setCurrentView} currentView={currentView} />
        <main style={{ flexGrow: 1, paddingBottom: '80px' }}>
          {shopContent}
        </main>
        <AppFooter currentView={currentView} setCurrentView={setCurrentView} cartItems={{}} isShopkeeper={true} newOrderCount={newOrderCount} userId={userId} />
      </div>
    );
  }

  // Consumer Interface
  return (
    <ConsumerApp
      currentView={currentView}
      setCurrentView={setCurrentView}
      selectedStore={selectedStore}
      setSelectedStore={setSelectedStore}
      cartItems={cartItems}
      setCartItems={setCartItems}
      authReady={authReady}
      userId={userId}
      stores={stores}
      products={products}
      allOrders={allOrders}
    />
  );
};

export default App;
