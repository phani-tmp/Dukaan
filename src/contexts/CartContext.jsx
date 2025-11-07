import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../services/firebase';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { db } = getFirebaseInstances();
  
  const [cartItems, setCartItems] = useState({});
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [selectedAddress, setSelectedAddress] = useState(null);

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

  const clearCart = useCallback(() => {
    setCartItems({});
  }, []);

  const handleCheckout = useCallback(async (userAddresses, setCurrentView) => {
    if (Object.keys(cartItems).length === 0) return;

    if (!userProfile || !userProfile.phoneNumber) {
      alert('Please set up your profile first (Profile tab → Add your details)');
      setCurrentView('Profile');
      return;
    }

    // Enforce profile completion before checkout
    if (!userProfile.profileCompleted) {
      alert('Please complete your profile before placing an order.\n\nGo to Profile → Edit your name and details.');
      setCurrentView('Profile');
      return;
    }

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
    const total = items.reduce((sum, item) => sum + (item.discountedPrice ?? item.price) * item.quantity, 0);

    const orderData = {
      userId: user.uid,
      customerName: userProfile.name || 'Customer',
      customerPhone: userProfile.phoneNumber,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn || item.name,
        nameTe: item.nameTe || item.name,
        originalPrice: item.price,
        discountedPrice: item.discountedPrice || null,
        price: item.discountedPrice ?? item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || '',
        weight: item.weight || '',
        category: item.category || ''
      })),
      total,
      totalSavings: items.reduce((sum, item) => {
        if (item.discountedPrice && item.discountedPrice < item.price) {
          return sum + ((item.price - item.discountedPrice) * item.quantity);
        }
        return sum;
      }, 0),
      status: 'pending',
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? selectedAddress.fullAddress : 'Store Pickup',
      deliveryInstructions: deliveryMethod === 'delivery' ? (selectedAddress.deliveryInstructions || '') : '',
      selectedAddressId: deliveryMethod === 'delivery' ? selectedAddress.id : null,
      deliveryLatitude: deliveryMethod === 'delivery' && selectedAddress?.latitude ? selectedAddress.latitude : null,
      deliveryLongitude: deliveryMethod === 'delivery' && selectedAddress?.longitude ? selectedAddress.longitude : null,
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
  }, [cartItems, user, userProfile, deliveryMethod, selectedAddress, db]);

  const value = {
    cartItems,
    deliveryMethod,
    setDeliveryMethod,
    selectedAddress,
    setSelectedAddress,
    handleAddToCart,
    clearCart,
    handleCheckout
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
