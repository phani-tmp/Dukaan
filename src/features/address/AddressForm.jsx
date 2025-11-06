import React, { useState } from 'react';
import { Save, X, MapPin, Navigation } from 'lucide-react';

const AddressForm = ({ onSave, onClose, editingAddress }) => {
  const [formData, setFormData] = useState({
    label: editingAddress?.label || 'Home',
    fullAddress: editingAddress?.fullAddress || '',
    deliveryInstructions: editingAddress?.deliveryInstructions || '',
    latitude: editingAddress?.latitude || null,
    longitude: editingAddress?.longitude || null
  });
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setFormData({
              ...formData,
              fullAddress: address,
              latitude,
              longitude
            });
            setLoadingLocation(false);
          } catch (error) {
            console.error('Error getting address:', error);
            setFormData({
              ...formData,
              fullAddress: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              latitude,
              longitude
            });
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter address manually or check location permissions.');
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your device.');
    }
  };

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
            <div style={{ position: 'relative' }}>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Enter complete delivery address"
                value={formData.fullAddress}
                onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingLocation}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: loadingLocation ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  opacity: loadingLocation ? 0.6 : 1
                }}
              >
                <Navigation className="w-4 h-4" />
                {loadingLocation ? 'Getting...' : 'Use My Location'}
              </button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="form-hint" style={{ color: '#4CAF50', marginTop: '8px' }}>
                <MapPin className="w-3 h-3" style={{ display: 'inline', marginRight: '4px' }} />
                Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            )}
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
