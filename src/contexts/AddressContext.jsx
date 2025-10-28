import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, where, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../services/firebase';
import { useAuth } from './AuthContext';

const AddressContext = createContext(null);

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const { user } = useAuth();
  const { db } = getFirebaseInstances();
  
  const [userAddresses, setUserAddresses] = useState([]);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    if (!user) return;

    const addressesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'addresses'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(addressesQuery, (snapshot) => {
      const addressesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserAddresses(addressesData);
    });

    return () => unsubscribe();
  }, [user, db]);

  const handleSaveAddress = async (addressData) => {
    if (!user) return;
    
    try {
      if (editingAddress?.id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'addresses', editingAddress.id), {
          ...addressData,
          updatedAt: new Date().toISOString()
        });
        alert('Address updated successfully!');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'addresses'), {
          ...addressData,
          userId: user.uid,
          isDefault: userAddresses.length === 0,
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

  const handleSetDefaultAddress = async (addressId) => {
    if (!user) return;
    
    try {
      const batch = [];
      userAddresses.forEach(addr => {
        const addressRef = doc(db, 'artifacts', appId, 'public', 'data', 'addresses', addr.id);
        batch.push(updateDoc(addressRef, { isDefault: false }));
      });
      await Promise.all(batch);
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'addresses', addressId), {
        isDefault: true
      });
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), {
        defaultAddressId: addressId
      });
      
      alert('Default address updated!');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const value = {
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
  };

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
};
