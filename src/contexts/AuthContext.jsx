import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithPhoneNumber, RecaptchaVerifier, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../services/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authStep, setAuthStep] = useState('phone');

  const { auth, db } = getFirebaseInstances();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[Auth] User authenticated:', firebaseUser.uid);
        setUser(firebaseUser);
        loadUserProfile(firebaseUser.uid);
      } else {
        console.log('[Auth] No user authenticated');
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const loadUserProfile = useCallback(async (uid) => {
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [db]);

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
      
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.log('[Auth] Error clearing old verifier:', e);
        }
        window.recaptchaVerifier = null;
      }
      
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
      
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      alert('Logged out successfully!');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      alert('Failed to logout');
    }
  };

  const handleSaveProfile = async (profileData) => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      await setDoc(userDocRef, {
        ...profileData,
        createdAt: new Date().toISOString()
      }, { merge: true });
      
      setShowProfileSetup(false);
      setUserProfile({ id: user.uid, ...profileData });
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    userProfile,
    phoneNumber,
    setPhoneNumber,
    countryCode,
    setCountryCode,
    otp,
    setOtp,
    authStep,
    showProfileSetup,
    setShowProfileSetup,
    handleSendOTP,
    handleVerifyOTP,
    handleLogout,
    handleSaveProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
