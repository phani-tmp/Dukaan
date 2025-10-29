import React, { useState } from 'react';
import { Bike, Phone, Lock, UserPlus, LogIn } from 'lucide-react';

const RiderLogin = ({ onLogin, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (!name || !phone || !password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        await onRegister({ name, phone, password });
      } else {
        if (!phone || !password) {
          setError('Phone and password are required');
          setLoading(false);
          return;
        }
        await onLogin(phone, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="rider-login-container">
      <div className="rider-login-card">
        <div className="rider-login-header">
          <div className="rider-icon-circle">
            <Bike className="w-12 h-12" style={{ color: '#FF9800' }} />
          </div>
          <h1 className="rider-login-title">
            {isRegistering ? 'Rider Registration' : 'Rider Login'}
          </h1>
          <p className="rider-login-subtitle">
            {isRegistering 
              ? 'Create your rider account to start delivering' 
              : 'Sign in to access your delivery dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rider-login-form">
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <UserPlus className="input-icon" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                  required={isRegistering}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <div className="input-with-icon">
              <Phone className="input-icon" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                className="form-input"
                maxLength="10"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="form-input"
                required
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="rider-login-button"
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isRegistering ? 'Register as Rider' : 'Login'}
              </>
            )}
          </button>
        </form>

        <div className="rider-login-footer">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="toggle-mode-button"
          >
            {isRegistering 
              ? 'Already have an account? Login' 
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .rider-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .rider-login-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .rider-login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .rider-icon-circle {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 16px rgba(255, 152, 0, 0.3);
        }

        .rider-icon-circle svg {
          color: white !important;
        }

        .rider-login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .rider-login-subtitle {
          font-size: 14px;
          color: #666;
        }

        .rider-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          color: #999;
        }

        .form-input {
          width: 100%;
          padding: 12px 12px 12px 44px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s;
        }

        .form-input:focus {
          outline: none;
          border-color: #FF9800;
          box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
        }

        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
        }

        .rider-login-button {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 8px;
        }

        .rider-login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(255, 152, 0, 0.3);
        }

        .rider-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .rider-login-footer {
          margin-top: 24px;
          text-align: center;
        }

        .toggle-mode-button {
          background: none;
          border: none;
          color: #667eea;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.3s;
        }

        .toggle-mode-button:hover {
          color: #764ba2;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default RiderLogin;
