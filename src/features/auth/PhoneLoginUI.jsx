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
    confirmPassword: ''
  });

  const handleRegistrationSubmit = () => {
    if (!registrationData.name || !registrationData.password) {
      alert('Please fill in all fields');
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
            
            <div id="recaptcha-container"></div>
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
                placeholder="Your Full Name"
                value={registrationData.name}
                onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                className="text-input"
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Create Password (min 6 characters)"
                value={registrationData.password}
                onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                className="password-input"
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={registrationData.confirmPassword}
                onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                className="password-input"
              />
            </div>
            
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
      </div>
    </div>
  );
};

export default PhoneLoginUI;
