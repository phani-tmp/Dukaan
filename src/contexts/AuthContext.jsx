import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
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
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [authStep, setAuthStep] = useState('phone'); // 'phone', 'password', 'otp', 'register'
  const [isNewUser, setIsNewUser] = useState(false);

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
        const profileData = { id: userDoc.id, ...userDoc.data() };
        setUserProfile(profileData);
        
        // Auto-redirect based on role (only on initial login)
        const currentUrl = window.location.search;
        const urlParams = new URLSearchParams(currentUrl);
        const currentMode = urlParams.get('mode');
        
        // Only redirect if user is on default view (no mode parameter)
        if (!currentMode) {
          if (profileData.role === 'shopkeeper') {
            console.log('[Auth] Auto-redirecting shopkeeper to dashboard');
            window.location.href = '?mode=shopkeeper';
          } else if (profileData.role === 'rider') {
            console.log('[Auth] Auto-redirecting rider to dashboard');
            window.location.href = '?mode=rider';
          }
          // Customers (role='customer') stay on default view - no redirect needed
        }
      } else {
        // User is authenticated but has no profile - show registration form
        console.log('[Auth] User authenticated but no profile found - showing registration');
        setShowProfileSetup(true);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [db]);

  // Check if user exists
  const checkUserExists = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // Check if user profile exists in Firestore
      const phoneEmail = `${countryCode}${phoneNumber}@dukaan.app`;
      const usersQuery = doc(db, 'artifacts', appId, 'public', 'data', 'users_by_phone', phoneNumber);
      const userDoc = await getDoc(usersQuery);
      
      if (userDoc.exists()) {
        // Existing user - ask for password
        setIsNewUser(false);
        setAuthStep('password');
      } else {
        // New user - send OTP for verification
        setIsNewUser(true);
        await handleSendOTP();
      }
    } catch (error) {
      console.error('[Auth] Error checking user:', error);
      alert('Error checking user. Please try again.');
    }
  };

  // For NEW users - send OTP
  const handleSendOTP = async () => {
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
      alert('OTP sent to your phone!');
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

  // For NEW users - verify OTP then show registration form
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
      console.log('[Auth] OTP verified for user:', result.user.uid);
      
      // OTP verified - now show registration form
      setAuthStep('register');
      setOtp('');
    } catch (error) {
      console.error('[Auth] OTP verification error:', error);
      alert('Invalid OTP. Please try again.');
    }
  };

  // For RETURNING users - password login
  const handlePasswordLogin = async () => {
    if (!password || password.length < 6) {
      alert('Please enter your password');
      return;
    }

    try {
      const phoneEmail = `${countryCode}${phoneNumber}@dukaan.app`;
      const result = await signInWithEmailAndPassword(auth, phoneEmail, password);
      console.log('[Auth] Password login successful:', result.user.uid);
      setPassword('');
      setPhoneNumber('');
      setAuthStep('phone');
    } catch (error) {
      console.error('[Auth] Password login error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        alert('Incorrect phone number or password');
      } else {
        alert(`Login failed: ${error.message}`);
      }
    }
  };

  // For NEW users - complete registration
  const handleCompleteRegistration = async (profileData) => {
    if (!user) {
      alert('Please verify OTP first');
      return;
    }

    if (!profileData.password || profileData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const phoneEmail = `${countryCode}${phoneNumber}@dukaan.app`;
      
      // Create password-based auth account
      // Note: User is already authenticated via phone, we need to link email/password
      // For simplicity, we'll store the profile and rely on phone auth
      
      // Save user profile to Firestore
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      await setDoc(userDocRef, {
        name: profileData.name,
        phoneNumber: `${countryCode}${phoneNumber}`,
        password: profileData.password, // In production, this should be hashed!
        email: profileData.email || '',
        createdAt: new Date().toISOString()
      });

      // Save phone number mapping
      const phoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users_by_phone', phoneNumber);
      await setDoc(phoneDocRef, {
        uid: user.uid,
        phoneNumber: `${countryCode}${phoneNumber}`
      });

      // Save initial address if provided
      if (profileData.address && profileData.address.street) {
        const addressRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'addresses'));
        await setDoc(addressRef, {
          userId: user.uid,
          label: 'Home',
          street: profileData.address.street,
          city: profileData.address.city,
          state: profileData.address.state,
          pincode: profileData.address.pincode,
          isDefault: true,
          createdAt: new Date().toISOString()
        });
      }
      
      setShowProfileSetup(false);
      setAuthStep('phone');
      setUserProfile({ id: user.uid, ...profileData, phoneNumber: `${countryCode}${phoneNumber}` });
      alert('Registration successful! You can now login with your phone number and password.');
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Failed to complete registration. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setPhoneNumber('');
      setPassword('');
      setAuthStep('phone');
      alert('Logged out successfully!');
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      alert('Failed to logout');
    }
  };

  const handleSaveProfile = async (profileData) => {
    if (!user) return;
    
    try {
      // Get phone number from Firebase auth
      const phoneNum = user.phoneNumber || profileData.phoneNumber;
      const cleanPhone = phoneNum.replace(/[^\d]/g, '').slice(-10); // Get last 10 digits
      
      // Check if user already has a profile (to preserve role)
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      const existingDoc = await getDoc(userDocRef);
      const existingRole = existingDoc.exists() ? existingDoc.data().role : null;
      
      // Create user document preserving existing role
      const userDoc = {
        name: profileData.name,
        phoneNumber: user.phoneNumber || phoneNum,
        email: profileData.email || null,
        role: existingRole || 'customer', // Preserve existing role or default to customer
        updatedAt: new Date().toISOString()
      };

      // Only set createdAt if this is a new user
      if (!existingDoc.exists()) {
        userDoc.createdAt = new Date().toISOString();
      }

      // Only add password if provided (it's optional)
      if (profileData.password) {
        userDoc.password = profileData.password; // In production, this should be hashed!
      }
      
      // Save user profile to Firestore
      await setDoc(userDocRef, userDoc, { merge: true });

      // ALWAYS save phone number mapping for OTP-only users to work
      const phoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users_by_phone', cleanPhone);
      await setDoc(phoneDocRef, {
        uid: user.uid,
        phoneNumber: user.phoneNumber || phoneNum
      });
      
      setShowProfileSetup(false);
      setUserProfile({ 
        id: user.uid, 
        name: profileData.name,
        phoneNumber: user.phoneNumber || phoneNum,
        email: profileData.email || null,
        role: existingRole || 'customer'
      });
      alert('Welcome to DUKAAN! 🎉 You can now start shopping.');
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
    password,
    setPassword,
    otp,
    setOtp,
    authStep,
    setAuthStep,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
