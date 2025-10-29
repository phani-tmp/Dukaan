import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, where, doc, updateDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../services/firebase';
import { categories as defaultCategories } from '../constants/categories';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const { db } = getFirebaseInstances();
  
  const [products, setProducts] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [subcategoriesData, setSubcategoriesData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const categoriesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'categories'));
    const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesDataFromDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategoriesData(categoriesDataFromDB);
    });

    return () => unsubscribe();
  }, [user, db]);

  useEffect(() => {
    if (!user) return;

    const subcategoriesQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'subcategories'));
    const unsubscribe = onSnapshot(subcategoriesQuery, (snapshot) => {
      const subcategoriesDataFromDB = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubcategoriesData(subcategoriesDataFromDB);
    });

    return () => unsubscribe();
  }, [user, db]);

  useEffect(() => {
    if (!user) return;

    const productsQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'products'));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

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
  }, [user, db]);

  useEffect(() => {
    if (!user) return;

    const allOrdersQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
    const unsubscribe = onSnapshot(allOrdersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllOrders(ordersData);
    });

    return () => unsubscribe();
  }, [user, db]);

  useEffect(() => {
    if (!user) return;

    const usersQuery = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(usersData);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleChangeDeliveryMethod = useCallback(async (orderId, newDeliveryMethod, selectedAddress = null) => {
    try {
      const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      
      const updateData = {
        deliveryMethod: newDeliveryMethod,
        updatedAt: new Date().toISOString()
      };
      
      if (newDeliveryMethod === 'pickup') {
        updateData.deliveryAddress = 'Store Pickup';
        updateData.deliveryInstructions = '';
        updateData.selectedAddressId = null;
      } else {
        if (!selectedAddress) {
          alert('Please select a delivery address');
          return;
        }
        updateData.deliveryAddress = selectedAddress.fullAddress || `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}`;
        updateData.deliveryInstructions = selectedAddress.deliveryInstructions || '';
        updateData.selectedAddressId = selectedAddress.id;
      }
      
      await updateDoc(orderRef, updateData);
      alert(`Order type changed to ${newDeliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'} successfully!`);
    } catch (error) {
      console.error('Error changing delivery method:', error);
      alert('Failed to change order type. Please try again.');
    }
  }, [db]);

  const value = {
    products,
    categoriesData,
    subcategoriesData,
    orders,
    allOrders,
    allUsers,
    loading,
    handleChangeDeliveryMethod
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
