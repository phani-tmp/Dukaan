import React from 'react';
import { Minus, Plus, IndianRupee, ShoppingBag, Truck, Check, ChevronLeft, ShoppingCart } from 'lucide-react';
import { translations } from '../../constants/translations';

const CartView = ({ 
  cartItems, 
  onAddToCart, 
  setCurrentView, 
  onCheckout, 
  language, 
  deliveryMethod, 
  setDeliveryMethod, 
  userAddresses, 
  selectedAddress, 
  setSelectedAddress 
}) => {
  const t = translations[language];
  const items = Object.values(cartItems);
  const total = items.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <ShoppingCart className="empty-icon" />
        <p className="empty-text">{t.cart} {t.empty}</p>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <div className="view-header">
        <button onClick={() => setCurrentView('Home')} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">{t.cart}</h2>
      </div>

      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.name}</h3>
              <p className="cart-item-weight">{item.weight}</p>
              <p className="cart-item-price">
                <IndianRupee className="w-4 h-4" />
                {item.discountedPrice || item.price}
              </p>
            </div>
            <div className="quantity-controls">
              <button onClick={() => onAddToCart(item, -1)} className="quantity-btn">
                <Minus className="w-4 h-4" />
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button onClick={() => onAddToCart(item, 1)} className="quantity-btn">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="delivery-method-section">
        <h3 className="section-title">Delivery Method</h3>
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
        <div className="address-selection-section">
          <h3 className="section-title">Delivery Address</h3>
          {userAddresses.length === 0 ? (
            <div className="no-address-msg">
              <p>No saved addresses. Please add an address from your Profile.</p>
              <button onClick={() => setCurrentView('Profile')} className="add-address-link">
                Add Address
              </button>
            </div>
          ) : (
            <div className="address-options">
              {userAddresses.map(addr => (
                <div 
                  key={addr.id} 
                  className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAddress(addr)}
                >
                  <div className="address-radio">
                    {selectedAddress?.id === addr.id && <Check className="w-4 h-4" />}
                  </div>
                  <div className="address-content">
                    <div className="address-label-row">
                      <span className={`address-label-badge ${addr.label.toLowerCase()}`}>
                        {addr.label}
                      </span>
                      {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                    </div>
                    <p className="address-text-small">{addr.fullAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="cart-footer">
        <div className="cart-total">
          <span>{t.total}</span>
          <span className="total-amount">
            <IndianRupee className="w-5 h-5" />
            {total.toFixed(0)}
          </span>
        </div>
        <button onClick={onCheckout} className="checkout-button">
          {t.placeOrder}
        </button>
      </div>
    </div>
  );
};

export default CartView;
