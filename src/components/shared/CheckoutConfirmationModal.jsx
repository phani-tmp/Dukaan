import React, { useState } from 'react';
import { Truck, ShoppingBag, MapPin, X, CheckCircle } from 'lucide-react';
import { translations } from '../../constants/translations';

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

  const cartTotal = cartItems.reduce((total, item) => total + ((item.discountedPrice ?? item.price) * item.quantity), 0);

  const t = language === 'te' ? translations.te : translations.en;

  const handleConfirmOrder = () => {
    if (deliveryMethod === 'delivery' && !selectedAddress) {
      alert(t.selectDeliveryAddress);
      return;
    }

    onConfirm(deliveryMethod);
  };

  const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{t.confirmOrder}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          <div className="checkout-section">
            <h3 className="checkout-section-title">{t.chooseDeliveryMethod}</h3>
            <div className="delivery-options">
              <button 
                className={`delivery-option-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                onClick={() => setDeliveryMethod('delivery')}
              >
                <Truck className="w-5 h-5" />
                <span>{t.homeDelivery}</span>
              </button>
              <button 
                className={`delivery-option-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                onClick={() => setDeliveryMethod('pickup')}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{t.storePickup}</span>
              </button>
            </div>
          </div>

          {deliveryMethod === 'delivery' && (
            <div className="checkout-section">
              <h3 className="checkout-section-title">{t.deliveryAddress}</h3>
              {userAddresses.length === 0 ? (
                <div className="no-address-msg">
                  <p>{t.noSavedAddresses}</p>
                  <button onClick={() => { onClose(); onManageAddresses(); }} className="add-address-btn">
                    {t.addAddress}
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
                            <span className="default-badge">{t.default}</span>
                          )}
                        </div>
                        <p className="address-text">{address.fullAddress}</p>
                        {address.deliveryInstructions && (
                          <p className="address-instructions">{t.note}: {address.deliveryInstructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { onClose(); onManageAddresses(); }} className="manage-addresses-link">
                    {t.manageAddresses}
                  </button>
                </>
              )}
            </div>
          )}

          {deliveryMethod === 'pickup' && (
            <div className="checkout-section">
              <div className="pickup-info-card">
                <ShoppingBag className="w-12 h-12 pickup-icon" />
                <h4>{t.storePickup}</h4>
                <p>{t.orderReadyPickup}</p>
                <p className="pickup-location">📍 Ponnur, Andhra Pradesh</p>
              </div>
            </div>
          )}

          <div className="checkout-section">
            <div className="order-summary">
              <h3 className="checkout-section-title">{t.orderSummary}</h3>
              <div className="summary-items">
                {cartItems.map(item => {
                  const itemName = language === 'te' ? (item.nameTe || item.nameEn || item.name) : (item.nameEn || item.name);
                  return (
                  <div key={item.id} className="summary-item">
                    <span>{itemName} × {item.quantity}</span>
                    <span>₹{((item.discountedPrice ?? item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                  );
                })}
              </div>
              <div className="summary-total">
                <span className="total-label">{t.total}</span>
                <span className="total-amount">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            {t.cancel}
          </button>
          <button 
            onClick={handleConfirmOrder} 
            className="confirm-order-btn"
            disabled={deliveryMethod === 'delivery' && userAddresses.length === 0}
          >
            <CheckCircle className="w-5 h-5" />
            {t.placeOrder} - ₹{cartTotal.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationModal;
