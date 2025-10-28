import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const ProfileSetupModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Welcome! Set Up Your Profile</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-setup-form">
          <div className="form-group">
            <label className="form-label">Your Name</label>
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
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary">
            <Save className="w-5 h-5" />
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
