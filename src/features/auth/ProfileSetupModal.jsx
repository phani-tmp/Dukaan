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
      password: formData.password || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '0' }}>
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white', padding: '24px', borderRadius: '16px 16px 0 0' }}>
          <h3 className="modal-title" style={{ color: 'white', margin: 0 }}>Welcome! 👋</h3>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginTop: '8px', margin: 0 }}>
            Just tell us your name to get started
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600' }}>
              <User className="w-4 h-4" />
              Your Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0', fontWeight: '600' }}>
              Optional (for future logins)
            </p>
            
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com (optional)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters (optional)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {formData.password && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-input"
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
          
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save className="w-5 h-5" />
            Complete Setup
          </button>

          <p style={{ fontSize: '11px', color: '#999', textAlign: 'center', marginTop: '12px', marginBottom: 0 }}>
            You can add your address later from your profile
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
