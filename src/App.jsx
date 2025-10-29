import React, { useState, useEffect } from 'react';

import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { useCart } from './contexts/CartContext';
import { useAddress } from './contexts/AddressContext';

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
    handleSaveProfile
  } = useAuth();

  const {
    products,
    categoriesData,
    subcategoriesData,
    orders,
    allOrders,
    loading: dataLoading,
    handleChangeDeliveryMethod
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
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState('Ponnur, AP');
  const [logoUrl, setLogoUrl] = useState('/dukaan-logo.png');
  const [notification, setNotification] = useState(null);
  const [previousOrderStatuses, setPreviousOrderStatuses] = useState({});
  const [isShopkeeperMode, setIsShopkeeperMode] = useState(false);
  const [isRiderMode, setIsRiderMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    setIsShopkeeperMode(mode === 'shopkeeper');
    setIsRiderMode(mode === 'rider');
    console.log('[Mode] Shopkeeper mode:', mode === 'shopkeeper', 'Rider mode:', mode === 'rider', 'URL:', window.location.search);
  }, []);

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
    handleCheckout(userAddresses, setCurrentView);
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
        language={language}
        onExit={() => window.location.href = '/'}
        categoriesData={categoriesData}
        subcategoriesData={subcategoriesData}
      />
    );
  }

  if (isRiderMode) {
    return (
      <RiderDashboard
        allOrders={allOrders}
        language={language}
        onExit={() => window.location.href = '/'}
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
