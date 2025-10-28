import React from 'react';
import { X, Phone, MapPin, IndianRupee } from 'lucide-react';
import { translations } from '../../constants/translations';

const OrderDetailsModal = ({ order, onClose, language }) => {
  const t = translations[language];

  const getStatusText = (status) => {
    const statusMap = {
      pending: t.orderPlaced,
      processing: t.processing,
      delivered: t.delivered
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return '#4CAF50';
    if (status === 'processing') return '#2196F3';
    return '#FF9800';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Order Details</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-order-info">
            <div className="modal-info-row">
              <span className="modal-label">Order ID</span>
              <span className="modal-value">#{order.id.substring(0, 12)}</span>
            </div>
            <div className="modal-info-row">
              <span className="modal-label">Order Date</span>
              <span className="modal-value">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="modal-info-row">
              <span className="modal-label">Status</span>
              <span className="modal-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                {getStatusText(order.status)}
              </span>
            </div>
            {order.phoneNumber && (
              <div className="modal-info-row">
                <span className="modal-label">Customer Phone</span>
                <a href={`tel:${order.phoneNumber}`} className="modal-phone-link">
                  <Phone className="w-4 h-4" />
                  {order.phoneNumber}
                </a>
              </div>
            )}
          </div>

          {order.deliveryAddress && (
            <div className="modal-delivery-section">
              <h4 className="modal-section-title">Delivery Details</h4>
              <div className="modal-address-card">
                <MapPin className="w-5 h-5 text-green-600" />
                <div className="modal-address-content">
                  <p className="modal-address-text">{order.deliveryAddress}</p>
                  {order.deliveryInstructions && (
                    <p className="modal-instructions-text">
                      <strong>Instructions:</strong> {order.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="modal-items-section">
            <h4 className="modal-section-title">Items Ordered</h4>
            <div className="modal-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="modal-item-card">
                  <div className="modal-item-image">
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/60'} 
                      alt={item.name}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                    />
                  </div>
                  <div className="modal-item-details">
                    <h5 className="modal-item-name">{item.name}</h5>
                    <p className="modal-item-weight">{item.weight}</p>
                    <p className="modal-item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <div className="modal-item-price">
                    <IndianRupee className="w-4 h-4" />
                    {(item.price * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-total-section">
            <span className="modal-total-label">Order Total</span>
            <span className="modal-total-amount">
              <IndianRupee className="w-5 h-5" />
              {order.total.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
