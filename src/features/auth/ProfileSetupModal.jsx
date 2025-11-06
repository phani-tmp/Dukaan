import React, { useState } from 'react';
import { Save, User, Lock, Mail } from 'lucide-react';

const ProfileSetupModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    // Password is optional, but if provided, validate it
    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Email is optional, but if provided, validate it
    if (formData.email && !formData.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    onSave({
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      password: formData.password || null,
      profileCompleted: true
    });
  };

  const handleSkip = () => {
    // User skipped profile setup - will get auto-generated username
    onSave({
      name: null, // Will be auto-generated as "User1", "User2", etc.
      email: null,
      password: null,
      profileCompleted: false
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', padding: '0', margin: '20px auto' }}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white', padding: '28px 24px', borderRadius: '16px 16px 0 0' }}>
          <h3 className="modal-title" style={{ color: 'white', margin: 0, fontSize: '24px', fontWeight: '700' }}>Welcome! 👋</h3>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.95)', marginTop: '10px', margin: 0 }}>
            Just tell us your name to get started
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '28px 24px' }}>
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', fontSize: '15px' }}>
              <User className="w-5 h-5" />
              Your Name *
            </label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '16px', padding: '14px 16px' }}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div style={{ background: '#f5f5f5', padding: '18px', borderRadius: '12px', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 16px 0', fontWeight: '600' }}>
              Optional (for future logins)
            </p>
            
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                <Mail className="w-5 h-5" />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                style={{ fontSize: '16px', padding: '14px 16px' }}
                placeholder="your@email.com (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                <Lock className="w-5 h-5" />
                Password
              </label>
              <input
                type="password"
                className="form-input"
                style={{ fontSize: '16px', padding: '14px 16px' }}
                placeholder="Minimum 6 characters (optional)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {formData.password && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' }}>
                  <Lock className="w-5 h-5" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  style={{ fontSize: '16px', padding: '14px 16px' }}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            )}

            <p style={{ fontSize: '11px', color: '#999', marginTop: '8px', marginBottom: 0 }}>
              💡 Skip password to continue with OTP-only login
            </p>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            <Save className="w-5 h-5" />
            Complete Setup
          </button>

          <button 
            type="button" 
            onClick={handleSkip}
            className="btn-secondary" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '14px', 
              fontWeight: '500', 
              background: 'transparent',
              color: '#4CAF50',
              border: '2px solid #4CAF50', 
              borderRadius: '12px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Skip for Now
          </button>

          <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '12px', marginBottom: 0 }}>
            You can complete your profile later before placing orders
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
