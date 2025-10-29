import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';

const RiderContext = createContext(null);

export const useRider = () => {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error('useRider must be used within RiderProvider');
  }
  return context;
};

export const RiderProvider = ({ children }) => {
  const { db, auth } = getFirebaseInstances();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRiderId = localStorage.getItem('riderId');
    if (storedRiderId) {
      loadRider(storedRiderId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadRider = async (riderId) => {
    try {
      const riderDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riders', riderId));
      if (riderDoc.exists()) {
        setRider({ id: riderDoc.id, ...riderDoc.data() });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading rider:', error);
      setLoading(false);
    }
  };

  const loginRider = async (phone, password) => {
    try {
      const ridersQuery = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'riders'),
        where('phone', '==', phone)
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(ridersQuery, (snapshot) => {
          unsubscribe();
          
          if (snapshot.empty) {
            reject(new Error('No rider found with this phone number'));
            return;
          }

          const riderDoc = snapshot.docs[0];
          const riderData = riderDoc.data();

          if (riderData.password !== password) {
            reject(new Error('Invalid password'));
            return;
          }

          const riderInfo = { id: riderDoc.id, ...riderData };
          setRider(riderInfo);
          localStorage.setItem('riderId', riderDoc.id);
          
          signInAnonymously(auth).catch(console.error);
          
          resolve(riderInfo);
        }, (error) => {
          unsubscribe();
          reject(error);
        });
      });
    } catch (error) {
      console.error('Rider login error:', error);
      throw error;
    }
  };

  const logoutRider = () => {
    setRider(null);
    localStorage.removeItem('riderId');
  };

  const registerRider = async (riderData) => {
    try {
      const riderId = `rider_${Date.now()}`;
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'riders', riderId), {
        ...riderData,
        createdAt: new Date().toISOString(),
        totalOrders: 0,
        activeOrders: 0
      });

      const newRider = { id: riderId, ...riderData };
      setRider(newRider);
      localStorage.setItem('riderId', riderId);
      
      await signInAnonymously(auth);
      
      return newRider;
    } catch (error) {
      console.error('Rider registration error:', error);
      throw error;
    }
  };

  const value = {
    rider,
    loading,
    loginRider,
    logoutRider,
    registerRider
  };

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
};
