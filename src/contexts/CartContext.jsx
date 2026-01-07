import React, { createContext, useContext, useState, useCallback } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../services/firebase';
import { useAuth } from './AuthContext';
import { generateOrderNumber } from '../utils/orderNumberGenerator';

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

  // Load initial cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : {};
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      return {};
    }
  });

  const [deliveryMethod, setDeliveryMethod] = useState('delivery');
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Persistence Effect
  React.useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }, [cartItems]);

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
    localStorage.removeItem('cartItems');
  }, []);

  const handleCheckout = useCallback(async (userAddresses, setCurrentView, language = 'en') => {
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
    const total = items.reduce((sum, item) => {
      const discounted = item.discountedPrice !== '' && item.discountedPrice != null ? Number(item.discountedPrice) : null;
      const original = Number(item.price) || 0;
      const price = discounted != null ? discounted : original;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    try {
      const orderNumber = await generateOrderNumber(db, appId);

      const orderData = {
        orderNumber,
        userId: user.uid,
        customerName: userProfile.name || 'Customer',
        customerPhone: userProfile.phoneNumber || '',
        customerLanguage: language,
        items: items.map(item => {
          const originalPrice = Number(item.price) || 0;
          const discountedPrice = item.discountedPrice !== '' && item.discountedPrice != null ? Number(item.discountedPrice) : null;
          const finalPrice = discountedPrice != null ? discountedPrice : originalPrice;

          return {
            id: item.id || '',
            name: item.name || '',
            nameEn: item.nameEn || item.name || '',
            nameTe: item.nameTe || item.name || '',
            originalPrice: originalPrice,
            discountedPrice: discountedPrice,
            price: finalPrice,
            quantity: Number(item.quantity) || 0,
            imageUrl: item.imageUrl || '',
            weight: item.weight || '',
            category: item.category || ''
          };
        }),
        total,
        totalSavings: items.reduce((sum, item) => {
          const originalPrice = Number(item.price) || 0;
          const discountedPrice = item.discountedPrice !== '' && item.discountedPrice != null ? Number(item.discountedPrice) : null;
          const quantity = Number(item.quantity) || 0;
          if (discountedPrice != null && discountedPrice < originalPrice) {
            return sum + ((originalPrice - discountedPrice) * quantity);
          }
          return sum;
        }, 0),
        status: 'pending',
        deliveryMethod: deliveryMethod || 'delivery',
        deliveryAddress: deliveryMethod === 'delivery' ? (selectedAddress?.fullAddress || '') : 'Store Pickup',
        deliveryInstructions: deliveryMethod === 'delivery' ? (selectedAddress?.deliveryInstructions || '') : '',
        selectedAddressId: deliveryMethod === 'delivery' && selectedAddress?.id ? selectedAddress.id : null,
        deliveryLatitude: deliveryMethod === 'delivery' && selectedAddress?.latitude ? selectedAddress.latitude : null,
        deliveryLongitude: deliveryMethod === 'delivery' && selectedAddress?.longitude ? selectedAddress.longitude : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), orderData);
      setCartItems({});
      setCurrentView('Orders');
      alert(`Order placed successfully! Order Number: ${orderNumber}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
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
