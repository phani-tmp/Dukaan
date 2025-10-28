import React from 'react';
import { Phone, CheckCircle } from 'lucide-react';

const PhoneLoginUI = ({ 
  countryCode, 
  phoneNumber, 
  otp, 
  authStep,
  onCountryCodeChange,
  onPhoneChange,
  onOtpChange,
  onSendOTP,
  onVerifyOTP
}) => {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">DUKAAN ఘుకాన్</h1>
          <p className="login-subtitle">Quick Commerce at your doorstep</p>
        </div>

        {authStep === 'phone' ? (
          <div className="login-form">
            <h2 className="form-title">Sign in with Phone</h2>
            <p className="form-hint">Enter your phone number to receive an OTP</p>
            
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
                onChange={(e) => onPhoneChange(e.target.value)}
                className="phone-input"
                maxLength="10"
              />
            </div>
            
            <button onClick={onSendOTP} className="login-btn">
              <Phone className="w-5 h-5" />
              Send OTP
            </button>
            
            <div id="recaptcha-container"></div>
          </div>
        ) : (
          <div className="login-form">
            <h2 className="form-title">Enter OTP</h2>
            <p className="form-hint">We sent a 6-digit code to {countryCode}{phoneNumber}</p>
            
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => onOtpChange(e.target.value)}
              className="otp-input"
              maxLength="6"
            />
            
            <button onClick={onVerifyOTP} className="login-btn">
              <CheckCircle className="w-5 h-5" />
              Verify & Login
            </button>
            
            <button 
              onClick={() => authStep === 'otp' && window.location.reload()} 
              className="back-btn"
            >
              Back to Phone Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneLoginUI;
