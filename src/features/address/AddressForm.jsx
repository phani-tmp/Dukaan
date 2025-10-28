import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

const AddressForm = ({ onSave, onClose, editingAddress }) => {
  const [formData, setFormData] = useState({
    label: editingAddress?.label || 'Home',
    fullAddress: editingAddress?.fullAddress || '',
    deliveryInstructions: editingAddress?.deliveryInstructions || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.fullAddress.trim()) {
      alert('Please enter an address');
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="address-form">
          <div className="form-group">
            <label className="form-label">Address Label</label>
            <select
              className="form-input"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Full Address</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Enter complete delivery address"
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              required
            />
            <p className="form-hint">In Phase 2, this will use Google Maps for easy address selection</p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Delivery Instructions (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Ring bell twice, Gate code 1234"
              value={formData.deliveryInstructions}
              onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save className="w-5 h-5" />
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
