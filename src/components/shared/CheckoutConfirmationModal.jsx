import React, { useState } from 'react';
import { Truck, ShoppingBag, MapPin, X, CheckCircle } from 'lucide-react';

const CheckoutConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cartItems, 
  userAddresses,
  selectedAddress,
  onAddressSelect,
  onManageAddresses,
  language
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState('delivery');

  if (!isOpen) return null;

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleConfirmOrder = () => {
    if (deliveryMethod === 'delivery' && !selectedAddress) {
      alert('Please select a delivery address');
      return;
    }

    onConfirm(deliveryMethod);
  };

  const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Confirm Order</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          <div className="checkout-section">
            <h3 className="section-title">Choose Delivery Method</h3>
            <div className="delivery-options">
              <button 
                className={`delivery-option-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                onClick={() => setDeliveryMethod('delivery')}
              >
                <Truck className="w-5 h-5" />
                <span>Home Delivery</span>
              </button>
              <button 
                className={`delivery-option-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                onClick={() => setDeliveryMethod('pickup')}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Store Pickup</span>
              </button>
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div className="checkout-section">
              <h3 className="section-title">Delivery Address</h3>
              {userAddresses.length === 0 ? (
                <div className="no-address-msg">
                  <p>No saved addresses.</p>
                  <button onClick={() => { onClose(); onManageAddresses(); }} className="add-address-btn">
                    Add Address
                  </button>
                </div>
              ) : (
                <>
                  <div className="address-list">
                    {userAddresses.map(address => (
                      <div 
                        key={address.id} 
                        className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                        onClick={() => onAddressSelect(address)}
                      >
                        <div className="address-header">
                          <span className={`address-label ${address.label.toLowerCase()}`}>
                            {address.label}
                          </span>
                          {address.isDefault && (
                            <span className="default-badge">Default</span>
                          )}
                        </div>
                        <p className="address-line">{address.street}</p>
                        <p className="address-line">{address.city}, {address.state} {address.pincode}</p>
                        {address.instructions && (
                          <p className="address-instructions">Note: {address.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { onClose(); onManageAddresses(); }} className="manage-addresses-link">
                    Manage Addresses
                  </button>
                </>
              )}
            </div>
          )}

          {deliveryMethod === 'pickup' && (
            <div className="checkout-section">
              <div className="pickup-info-card">
                <ShoppingBag className="w-12 h-12 pickup-icon" />
                <h4>Store Pickup</h4>
                <p>Your order will be ready for pickup at the store.</p>
                <p className="pickup-location">📍 Ponnur, Andhra Pradesh</p>
              </div>
            </div>
          )}

          <div className="checkout-section">
            <div className="order-summary">
              <h3 className="section-title">Order Summary</h3>
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span className="total-label">Total</span>
                <span className="total-amount">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleConfirmOrder} 
            className="confirm-order-btn"
            disabled={deliveryMethod === 'delivery' && userAddresses.length === 0}
          >
            <CheckCircle className="w-5 h-5" />
            Place Order - ₹{cartTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationModal;
