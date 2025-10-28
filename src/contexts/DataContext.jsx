import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
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
      if (categoriesDataFromDB.length === 0) {
        setCategoriesData(defaultCategories);
      } else {
        setCategoriesData(categoriesDataFromDB);
      }
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

  const value = {
    products,
    categoriesData,
    subcategoriesData,
    orders,
    allOrders,
    allUsers,
    loading
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
