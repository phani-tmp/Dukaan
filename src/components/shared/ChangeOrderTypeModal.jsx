import React, { useState } from 'react';
import { Truck, ShoppingBag, X, Check } from 'lucide-react';

const ChangeOrderTypeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentMethod,
  userAddresses,
  onManageAddresses
}) => {
  const [selectedAddress, setSelectedAddress] = useState(
    userAddresses.find(addr => addr.isDefault) || userAddresses[0] || null
  );

  if (!isOpen) return null;

  const newMethod = currentMethod === 'delivery' ? 'pickup' : 'delivery';

  const handleConfirm = () => {
    if (newMethod === 'delivery') {
      if (userAddresses.length === 0) {
        alert('Please add a delivery address first');
        onClose();
        onManageAddresses();
        return;
      }
      if (!selectedAddress) {
        alert('Please select a delivery address');
        return;
      }
      onConfirm(newMethod, selectedAddress);
    } else {
      onConfirm(newMethod, null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Change Order Type</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          <div className="change-type-info">
            <div className="current-method-display">
              <span className="change-label">Current:</span>
              {currentMethod === 'delivery' ? (
                <div className="method-badge delivery">
                  <Truck className="w-4 h-4" />
                  <span>Home Delivery</span>
                </div>
              ) : (
                <div className="method-badge pickup">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Store Pickup</span>
                </div>
              )}
            </div>

            <div className="arrow-divider">→</div>

            <div className="new-method-display">
              <span className="change-label">Change to:</span>
              {newMethod === 'delivery' ? (
                <div className="method-badge delivery">
                  <Truck className="w-4 h-4" />
                  <span>Home Delivery</span>
                </div>
              ) : (
                <div className="method-badge pickup">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Store Pickup</span>
                </div>
              )}
            </div>
          </div>

          {newMethod === 'delivery' && (
            <div className="address-selection-section">
              <h3 className="section-title">Select Delivery Address</h3>
              {userAddresses.length === 0 ? (
                <div className="no-address-msg">
                  <p>No saved addresses. Please add one first.</p>
                  <button onClick={() => { onClose(); onManageAddresses(); }} className="add-address-btn">
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="address-list">
                  {userAddresses.map(address => (
                    <div 
                      key={address.id} 
                      className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="address-selection-radio">
                        {selectedAddress?.id === address.id && <Check className="w-4 h-4" />}
                      </div>
                      <div className="address-info">
                        <div className="address-header">
                          <span className={`address-label ${address.label.toLowerCase()}`}>
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="default-badge">Default</span>
                          )}
                        </div>
                        <p className="address-text">{address.fullAddress}</p>
                        {address.deliveryInstructions && (
                          <p className="address-instructions-small">Note: {address.deliveryInstructions}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {newMethod === 'pickup' && (
            <div className="pickup-confirmation">
              <p className="confirmation-text">
                Your order will be ready for pickup at the store.
              </p>
              <p className="store-location">📍 Ponnur, Andhra Pradesh</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleConfirm} 
            className="confirm-btn"
            disabled={newMethod === 'delivery' && userAddresses.length === 0}
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeOrderTypeModal;
