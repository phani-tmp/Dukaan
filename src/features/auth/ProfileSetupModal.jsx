import React, { useState } from 'react';
import { Save, X, User, Lock, MapPin } from 'lucide-react';

const ProfileSetupModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: 'Andhra Pradesh',
      pincode: ''
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (!formData.address.street || !formData.address.city || !formData.address.pincode) {
      alert('Please enter your complete address');
      return;
    }
    
    if (formData.address.pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    
    // Pass phone number from Firebase auth or user input
    onSave({
      ...formData,
      phoneNumber: formData.phoneNumber || 'Unknown'
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3 className="modal-title">Complete Your Profile</h3>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            Please fill in your details to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-setup-form" style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label">
              <User className="w-4 h-4" style={{ display: 'inline', marginRight: '6px' }} />
              Your Full Name *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock className="w-4 h-4" style={{ display: 'inline', marginRight: '6px' }} />
              Create Password *
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock className="w-4 h-4" style={{ display: 'inline', marginRight: '6px' }} />
              Confirm Password *
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div style={{ borderTop: '1px solid #e0e0e0', margin: '20px 0', paddingTop: '20px' }}>
            <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
              <MapPin className="w-4 h-4" style={{ display: 'inline', marginRight: '6px' }} />
              Your Address
            </label>
            
            <input
              type="text"
              className="form-input"
              placeholder="Street / Area / Village *"
              value={formData.address.street}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              style={{ marginBottom: '12px' }}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="City *"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                required
              />
              <input
                type="text"
                className="form-input"
                placeholder="Pincode *"
                value={formData.address.pincode}
                onChange={(e) => {
                  const numbers = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({
                    ...formData,
                    address: { ...formData.address, pincode: numbers }
                  });
                }}
                maxLength="6"
                required
              />
            </div>

            <select
              className="form-input"
              value={formData.address.state}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, state: e.target.value }
              })}
              style={{ marginBottom: '12px' }}
            >
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
            <Save className="w-5 h-5" />
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
