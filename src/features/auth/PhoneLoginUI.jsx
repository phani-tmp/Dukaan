import React, { useState } from 'react';
import { Phone, CheckCircle, Lock, User } from 'lucide-react';

const PhoneLoginUI = ({
  phoneNumber,
  onPhoneChange,
  countryCode,
  onCountryCodeChange,
  password,
  onPasswordChange,
  otp,
  onOtpChange,
  authStep,
  isNewUser,
  onCheckUser,
  onSendOTP,
  onVerifyOTP,
  onPasswordLogin,
  onCompleteRegistration
}) => {
  const [registrationData, setRegistrationData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: 'Andhra Pradesh',
      pincode: ''
    }
  });

  const handleRegistrationSubmit = () => {
    if (!registrationData.name || !registrationData.password) {
      alert('Please fill in all required fields');
      return;
    }
    if (registrationData.password !== registrationData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (registrationData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (!registrationData.address.street || !registrationData.address.city || !registrationData.address.pincode) {
      alert('Please enter your address details');
      return;
    }
    if (registrationData.address.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    
    onCompleteRegistration(registrationData);
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">DUKAAN దుకాణ్</h1>
          <p className="login-subtitle">
            {authStep === 'phone' && 'Welcome! Enter your phone number'}
            {authStep === 'password' && 'Welcome back! Enter your password'}
            {authStep === 'otp' && 'Verify your phone number'}
            {authStep === 'register' && 'Complete your registration'}
          </p>
        </div>

        {authStep === 'phone' && (
          <div className="login-form">
            <h2 className="form-title">Phone Number</h2>
            
            <div className="phone-input-group">
              <select 
                value={countryCode} 
                onChange={(e) => onCountryCodeChange(e.target.value)}
                className="country-code-select"
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (UAE)</option>
              </select>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                  onPhoneChange(numbers);
                }}
                className="phone-input"
                maxLength="10"
              />
            </div>
            
            <button 
              onClick={onCheckUser} 
              className="login-btn"
              disabled={phoneNumber.length !== 10}
            >
              <Phone className="w-5 h-5" />
              Continue
            </button>
          </div>
        )}

        {authStep === 'password' && (
          <div className="login-form">
            <h2 className="form-title">Enter Password</h2>
            <p className="form-hint">Phone: {countryCode}{phoneNumber}</p>
            
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="password-input"
              />
            </div>
            
            <button onClick={onPasswordLogin} className="login-btn">
              <CheckCircle className="w-5 h-5" />
              Login
            </button>
            
            <button 
              onClick={onSendOTP} 
              className="otp-link-btn"
              style={{
                background: 'transparent',
                border: '2px solid #4CAF50',
                color: '#4CAF50',
                marginTop: '12px'
              }}
            >
              <Phone className="w-5 h-5" />
              Use OTP Instead
            </button>
            
            <button 
              onClick={() => window.location.reload()} 
              className="back-btn"
            >
              Change Phone Number
            </button>
          </div>
        )}

        {authStep === 'otp' && (
          <div className="login-form">
            <h2 className="form-title">Enter OTP</h2>
            <p className="form-hint">We sent a 6-digit code to {countryCode}{phoneNumber}</p>
            
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                const numbers = e.target.value.replace(/\D/g, '').slice(0, 6);
                onOtpChange(numbers);
              }}
              className="otp-input"
              maxLength="6"
            />
            
            <button 
              onClick={onVerifyOTP} 
              className="login-btn"
              disabled={otp.length !== 6}
            >
              <CheckCircle className="w-5 h-5" />
              Verify OTP
            </button>
            
            <button 
              onClick={() => window.location.reload()} 
              className="back-btn"
            >
              Change Phone Number
            </button>
          </div>
        )}

        {authStep === 'register' && (
          <div className="login-form">
            <h2 className="form-title">Create Your Account</h2>
            <p className="form-hint">Phone verified: {countryCode}{phoneNumber}</p>
            
            <div className="input-group">
              <User className="input-icon" />
              <input
                type="text"
                placeholder="Your Full Name *"
                value={registrationData.name}
                onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                className="text-input"
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Create Password (min 6 characters) *"
                value={registrationData.password}
                onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                className="password-input"
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm Password *"
                value={registrationData.confirmPassword}
                onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                className="password-input"
              />
            </div>

            <div className="registration-divider">
              <span>Your Address</span>
            </div>

            <input
              type="text"
              placeholder="Street / Area / Village *"
              value={registrationData.address.street}
              onChange={(e) => setRegistrationData({
                ...registrationData,
                address: {...registrationData.address, street: e.target.value}
              })}
              className="registration-input"
            />

            <div className="registration-row">
              <input
                type="text"
                placeholder="City *"
                value={registrationData.address.city}
                onChange={(e) => setRegistrationData({
                  ...registrationData,
                  address: {...registrationData.address, city: e.target.value}
                })}
                className="registration-input"
                style={{flex: 1}}
              />
              <input
                type="text"
                placeholder="Pincode *"
                value={registrationData.address.pincode}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setRegistrationData({
                    ...registrationData,
                    address: {...registrationData.address, pincode: numbers}
                  });
                }}
                className="registration-input"
                style={{flex: 1}}
                maxLength="6"
              />
            </div>

            <select
              value={registrationData.address.state}
              onChange={(e) => setRegistrationData({
                ...registrationData,
                address: {...registrationData.address, state: e.target.value}
              })}
              className="registration-select"
            >
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Other">Other</option>
            </select>
            
            <button 
              onClick={handleRegistrationSubmit} 
              className="login-btn"
              disabled={!registrationData.name || !registrationData.password || !registrationData.confirmPassword}
            >
              <CheckCircle className="w-5 h-5" />
              Complete Registration
            </button>
          </div>
        )}
        
        {/* reCAPTCHA container for Firebase Phone Auth (invisible, allows Play Integrity on Android) */}
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
};

export default PhoneLoginUI;
