import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';
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
      console.log('[Auth] Loading profile for UID:', uid);
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const profileData = { id: userDoc.id, ...userDoc.data() };
        console.log('[Auth] Profile loaded:', profileData.name, 'Role:', profileData.role);
        setUserProfile(profileData);
        setShowProfileSetup(false); // Hide profile setup for existing users
        
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
        // User is authenticated but has no profile
        // Only show profile setup if they're in the registration step
        console.log('[Auth] User authenticated but no profile found for UID:', uid);
        setUserProfile(null);
        // Don't automatically show profile setup here - let the auth flow control it
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUserProfile(null);
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
        // Existing user found - get their full profile to check if they have a password
        const userId = userDoc.data().uid;
        const userProfileRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userId);
        const userProfile = await getDoc(userProfileRef);
        
        if (userProfile.exists() && userProfile.data().password) {
          // User has a password - ask for password
          setIsNewUser(false);
          setAuthStep('password');
        } else {
          // User exists but has no password (OTP-only user) - send OTP
          console.log('[Auth] OTP-only user detected - sending OTP');
          setIsNewUser(false);
          await handleSendOTP();
        }
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

  // Verify OTP for both new and existing users
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
      
      // Check if this is a new user or existing OTP-only user
      if (isNewUser) {
        // New user - show registration form
        console.log('[Auth] New user - showing registration/profile setup');
        setShowProfileSetup(true);
        setAuthStep('register');
      } else {
        // Existing OTP-only user - they're now authenticated
        // onAuthStateChanged will load their profile automatically
        console.log('[Auth] Existing OTP-only user - login complete');
        setShowProfileSetup(false); // Explicitly hide profile setup for existing users
        setAuthStep('phone');
      }
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
      setShowProfileSetup(false); // Explicitly hide profile setup for logged-in users
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
      
      // PREVENT DUPLICATE PHONE NUMBERS: Check if this phone is already registered to a different user
      const phoneDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users_by_phone', cleanPhone);
      const existingPhoneMapping = await getDoc(phoneDocRef);
      
      if (existingPhoneMapping.exists() && existingPhoneMapping.data().uid !== user.uid) {
        // Phone number is already used by a different user - prevent duplicate
        alert('This phone number is already registered. Please use a different number or login with your existing account.');
        console.error('[Auth] Duplicate phone number detected:', cleanPhone, 'Existing UID:', existingPhoneMapping.data().uid, 'Current UID:', user.uid);
        return;
      }
      
      // Check if user already has a profile (to preserve role)
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      const existingDoc = await getDoc(userDocRef);
      const existingRole = existingDoc.exists() ? existingDoc.data().role : null;
      
      // Generate auto username if name not provided (user clicked "Skip for Now")
      let userName = profileData.name;
      if (!userName) {
        // Count existing users to generate unique username
        const usersSnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'users'));
        const userCount = usersSnapshot.size;
        userName = `User${userCount + 1}`;
        console.log('[Auth] Auto-generated username:', userName);
      }
      
      // Create user document preserving existing role
      const userDoc = {
        name: userName,
        phoneNumber: user.phoneNumber || phoneNum,
        email: profileData.email || null,
        role: existingRole || 'customer', // Preserve existing role or default to customer
        profileCompleted: profileData.profileCompleted || false, // Track if user completed setup or skipped
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

      // Save phone number mapping (now safe - we checked for duplicates above)
      await setDoc(phoneDocRef, {
        uid: user.uid,
        phoneNumber: user.phoneNumber || phoneNum
      });
      
      setShowProfileSetup(false);
      const updatedProfile = { 
        id: user.uid, 
        name: userName,
        phoneNumber: user.phoneNumber || phoneNum,
        email: profileData.email || null,
        role: existingRole || 'customer',
        profileCompleted: profileData.profileCompleted || false
      };
      
      console.log('[Auth] Profile saved successfully:', updatedProfile);
      setUserProfile(updatedProfile);
      
      if (profileData.profileCompleted) {
        alert('Welcome to DUKAAN! 🎉 You can now start shopping.');
      } else {
        alert('Welcome to DUKAAN! You can complete your profile anytime from the Profile tab.');
      }
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
