import React, { useState, useEffect } from 'react';

import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { useCart } from './contexts/CartContext';
import { useAddress } from './contexts/AddressContext';
import { useRider } from './contexts/RiderContext';

import { translations } from './constants/translations';

import LoadingSpinner from './components/shared/LoadingSpinner';
import ToastNotification from './components/shared/ToastNotification';
import AppHeader from './components/shared/AppHeader';
import BottomNavigation from './components/shared/BottomNavigation';
import OrderDetailsModal from './components/shared/OrderDetailsModal';
import CheckoutConfirmationModal from './components/shared/CheckoutConfirmationModal';

import HomeView from './features/customer/HomeView';
import CartView from './features/customer/CartView';
import OrdersView from './features/customer/OrdersView';
import ProfileView from './features/customer/ProfileView';
import OrderHistoryView from './features/customer/OrderHistoryView';

import PhoneLoginUI from './features/auth/PhoneLoginUI';
import ProfileSetupModal from './features/auth/ProfileSetupModal';

import AddressManager from './features/address/AddressManager';
import AddressForm from './features/address/AddressForm';

import ShopkeeperDashboard from './features/shopkeeper/ShopkeeperDashboard';
import RiderDashboard from './features/rider/RiderDashboard';
import RiderLogin from './features/rider/RiderLogin';

function App() {
  const {
    user,
    loading: authLoading,
    userProfile,
    phoneNumber,
    setPhoneNumber,
    countryCode,
    setCountryCode,
    password,
    setPassword,
    otp,
    setOtp,
    authStep,
    isNewUser,
    showProfileSetup,
    setShowProfileSetup,
    checkUserExists,
    handleSendOTP,
    handleVerifyOTP,
    handlePasswordLogin,
    handleCompleteRegistration,
    handleLogout,
    handleSaveProfile,

    handleHostedPhoneLogin
  } = useAuth();

  const {
    rider,
    loading: riderLoading,
    loginRider,
    logoutRider,
    registerRider
  } = useRider();

  const {
    products,
    categoriesData,
    subcategoriesData,
    orders,
    allOrders,
    allRiders,
    loading: dataLoading,
    handleChangeDeliveryMethod,
    handleCancelOrder
  } = useData();

  const {
    cartItems,
    deliveryMethod,
    setDeliveryMethod,
    selectedAddress,
    setSelectedAddress,
    handleAddToCart,
    handleCheckout
  } = useCart();

  const {
    userAddresses,
    showAddressManager,
    setShowAddressManager,
    showAddressForm,
    setShowAddressForm,
    editingAddress,
    setEditingAddress,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefaultAddress
  } = useAddress();

  const [currentView, setCurrentView] = useState('Home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [voiceSearchResults, setVoiceSearchResults] = useState(null);
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('Getting location...');
  const [logoUrl, setLogoUrl] = useState('/dukaan-logo.png');
  const [notification, setNotification] = useState(null);
  const [previousOrderStatuses, setPreviousOrderStatuses] = useState({});
  const [isShopkeeperMode, setIsShopkeeperMode] = useState(false);
  const [isRiderMode, setIsRiderMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();

            const city = data.city || data.locality || data.principalSubdivision || 'Unknown';
            const state = data.principalSubdivisionCode || '';
            setLocation(`${city}${state ? ', ' + state : ''}`);
          } catch (error) {
            console.error('Error getting location name:', error);
            setLocation('Ponnur, AP');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocation('Ponnur, AP');
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocation('Ponnur, AP');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    setIsShopkeeperMode(mode === 'shopkeeper');
    setIsRiderMode(mode === 'rider');
    console.log('[Mode] Shopkeeper mode:', mode === 'shopkeeper', 'Rider mode:', mode === 'rider', 'URL:', window.location.search);
  }, []);

  // Deep Link Listener for Hosted Auth
  useEffect(() => {
    // 1. Handle Native Deep Links (existing logic)
    import('@capacitor/app').then(({ App }) => {
      App.addListener('appUrlOpen', async (event) => {
        try {
          const url = event.url;
          console.log('[DeepLink] URL received:', url);

          if (url.startsWith('mydukaan://auth-complete')) {
            const queryString = url.split('?')[1] || '';
            const params = new URLSearchParams(queryString);
            const token = params.get('token');

            if (token) {
              console.log('[DeepLink] Token found, signing in...');
              const { getAuth, signInWithCustomToken } = await import('firebase/auth');
              const { getFirebaseInstances } = await import('./services/firebase');
              const { auth } = getFirebaseInstances();

              await signInWithCustomToken(auth, token);
              console.log('[DeepLink] Signed in successfully via custom token');

              setNotification({
                message: 'Login successful!',
                type: 'success'
              });
            }
          }
        } catch (err) {
          console.error('[DeepLink] Error handling deep link:', err);
          setNotification({
            message: 'Login failed via deep link',
            type: 'error'
          });
        }
      });
    });

    // 2. Handle Web URL Parameters (New Fix for Localhost)
    const checkWebToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        console.log('[WebAuth] Token found in URL, signing in...');
        try {
          const { signInWithCustomToken } = await import('firebase/auth');
          const { getFirebaseInstances } = await import('./services/firebase');
          const { auth } = getFirebaseInstances();

          await signInWithCustomToken(auth, token);
          console.log('[WebAuth] Signed in successfully via URL token');

          setNotification({
            message: 'Login successful!',
            type: 'success'
          });

          // Clear query params to clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);

        } catch (err) {
          console.error('[WebAuth] Error signing in with token:', err);
          setNotification({
            message: 'Login failed. Please try again.',
            type: 'error'
          });
        }
      }
    };

    checkWebToken();
  }, []);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const { db } = await import('./services/firebase').then(module => ({
          db: module.getFirebaseInstances().db
        }));
        const { doc, getDoc } = await import('firebase/firestore');
        const { appId } = await import('./services/firebase');

        const logoDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'app'));
        if (logoDoc.exists() && logoDoc.data().logoUrl) {
          setLogoUrl(logoDoc.data().logoUrl);
        }
      } catch (error) {
        console.log('Logo not found, using default');
      }
    };
    loadLogo();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setVoiceSearchResults(null);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!user || isShopkeeperMode || isRiderMode || orders.length === 0) return;

    const currentStatuses = {};
    orders.forEach(order => {
      currentStatuses[order.id] = order.status;
    });

    orders.forEach(order => {
      const previousStatus = previousOrderStatuses[order.id];
      const currentStatus = order.status;

      if (previousStatus && previousStatus !== currentStatus && order.updatedAt) {
        const updateTime = new Date(order.updatedAt).getTime();
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - updateTime;

        if (timeDiff < 10000) {
          if (currentStatus === 'processing') {
            setNotification({
              message: '🎉 Your order has been accepted! We are preparing it now.',
              type: 'success'
            });
          } else if (currentStatus === 'delivered') {
            setNotification({
              message: '✅ Your order has been delivered! Thank you for shopping.',
              type: 'success'
            });
          }
        }
      }
    });

    setPreviousOrderStatuses(currentStatuses);
  }, [orders, isShopkeeperMode, isRiderMode, user]);

  useEffect(() => {
    if (userAddresses.length > 0 && !selectedAddress && deliveryMethod === 'delivery') {
      const defaultAddr = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [userAddresses, selectedAddress, deliveryMethod]);

  const handleConfirmCheckout = (checkoutDeliveryMethod) => {
    setDeliveryMethod(checkoutDeliveryMethod);

    if (checkoutDeliveryMethod === 'delivery') {
      if (!selectedAddress && userAddresses.length > 0) {
        const defaultAddr = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
        setSelectedAddress(defaultAddr);
      }
    } else {
      setSelectedAddress(null);
    }

    setShowCheckoutModal(false);
    handleCheckout(userAddresses, setCurrentView, language);
  };

  const loading = authLoading || dataLoading;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isShopkeeperMode) {
    return (
      <ShopkeeperDashboard
        products={products}
        allOrders={allOrders}
        allRiders={allRiders}
        language={language}
        onExit={() => window.location.href = '/'}
        categoriesData={categoriesData}
        subcategoriesData={subcategoriesData}
        logoUrl={logoUrl}
        onLogoChange={setLogoUrl}
        toggleLanguage={toggleLanguage}
      />
    );
  }

  if (isRiderMode) {
    if (riderLoading) {
      return <LoadingSpinner />;
    }

    if (!rider) {
      return (
        <RiderLogin
          onLogin={loginRider}
          onRegister={registerRider}
        />
      );
    }

    return (
      <RiderDashboard
        rider={rider}
        allOrders={allOrders}
        language={language}
        onExit={() => {
          logoutRider();
          window.location.href = '/';
        }}
      />
    );
  }

  if (!user) {
    return (
      <>
        <PhoneLoginUI
          phoneNumber={phoneNumber}
          onPhoneChange={setPhoneNumber}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          password={password}
          onPasswordChange={setPassword}
          otp={otp}
          onOtpChange={setOtp}
          authStep={authStep}
          isNewUser={isNewUser}
          onCheckUser={checkUserExists}
          onSendOTP={handleSendOTP}
          onVerifyOTP={handleVerifyOTP}
          onPasswordLogin={handlePasswordLogin}
          onCompleteRegistration={handleCompleteRegistration}

          onHostedLogin={handleHostedPhoneLogin}
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

  const handleVoiceSearch = (foundProducts, voiceQuery) => {
    setVoiceSearchResults(foundProducts);
    setSearchTerm('');
    setCurrentView('Home');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  return (
    <div className="app-container-modern">
      <AppHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        location={location}
        language={language}
        toggleLanguage={toggleLanguage}
        logoUrl={logoUrl}
        products={products}
        onVoiceSearch={handleVoiceSearch}
        onVoiceProcessing={setIsVoiceSearching}
      />

      {isVoiceSearching && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4CAF50'
        }}>
          <div className="voice-pulse-large" style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#4CAF50', animation: 'voicePulse 1.5s infinite',
            marginBottom: '20px'
          }}></div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {language === 'te' ? 'వెతుకుతోంది...' : 'Searching...'}
          </h3>
        </div>
      )}

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
            voiceSearchResults={voiceSearchResults}
            setVoiceSearchResults={setVoiceSearchResults}
          />
        )}

        {currentView === 'Cart' && (
          <CartView
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            setCurrentView={setCurrentView}
            onCheckout={() => setShowCheckoutModal(true)}
            language={language}
          />
        )}

        {currentView === 'Orders' && (
          <OrdersView
            orders={orders}
            setCurrentView={setCurrentView}
            language={language}
            onSelectOrder={setSelectedOrder}
            onChangeDeliveryMethod={handleChangeDeliveryMethod}
            onCancelOrder={handleCancelOrder}
            userAddresses={userAddresses}
            onManageAddresses={() => setShowAddressManager(true)}
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
            translations={translations}
          />
        )}
      </div>

      <BottomNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartItems={cartItems}
        language={language}
        onHomeClick={() => {
          setVoiceSearchResults(null);
          setSearchTerm(''); // Clear search term
          setSelectedCategory(null);
          setSelectedSubcategory(null);
          setCurrentView('Home'); // Ensure view is reset
        }}
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

      {showProfileSetup && (
        <ProfileSetupModal
          onSave={handleSaveProfile}
          onClose={() => setShowProfileSetup(false)}
        />
      )}

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

      {showCheckoutModal && (
        <CheckoutConfirmationModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={handleConfirmCheckout}
          cartItems={Object.values(cartItems)}
          userAddresses={userAddresses}
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
          onManageAddresses={() => {
            setShowCheckoutModal(false);
            setShowAddressManager(true);
          }}
          language={language}
        />
      )}
    </div>
  );
}

export default App;
