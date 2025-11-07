import React from 'react';
import { X, Phone, MapPin, IndianRupee } from 'lucide-react';
import { translations } from '../../constants/translations';

const OrderDetailsModal = ({ order, onClose, language }) => {
  const t = translations[language];

  const getStatusText = (status) => {
    const statusMap = {
      pending: t.pending,
      accepted: t.accepted,
      processing: t.processing,
      ready_for_pickup: t.readyForPickup,
      out_for_delivery: t.outForDelivery,
      delivered: t.delivered,
      completed: t.completed,
      cancelled: t.cancelled
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#9E9E9E';
      case 'accepted': return '#2196F3';
      case 'processing': return '#2196F3';
      case 'ready_for_pickup': return '#9C27B0';
      case 'out_for_delivery': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t.orderDetails}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-order-info">
            <div className="modal-info-row">
              <span className="modal-label">{t.orderID}</span>
              <span className="modal-value">{order.orderNumber || `#${order.id.substring(0, 12)}`}</span>
            </div>
            <div className="modal-info-row">
              <span className="modal-label">{t.orderDate}</span>
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
              <span className="modal-label">{t.status}</span>
              <span className="modal-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                {getStatusText(order.status)}
              </span>
            </div>
            {order.phoneNumber && (
              <div className="modal-info-row">
                <span className="modal-label">{t.customerPhone}</span>
                <a href={`tel:${order.phoneNumber}`} className="modal-phone-link">
                  <Phone className="w-4 h-4" />
                  {order.phoneNumber}
                </a>
              </div>
            )}
          </div>

          {order.deliveryAddress && (
            <div className="modal-delivery-section">
              <h4 className="modal-section-title">{t.deliveryDetails}</h4>
              <div className="modal-address-card">
                <MapPin className="w-5 h-5 text-green-600" />
                <div className="modal-address-content">
                  <p className="modal-address-text">{order.deliveryAddress}</p>
                  {order.deliveryInstructions && (
                    <p className="modal-instructions-text">
                      <strong>{t.instructions}:</strong> {order.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="modal-items-section">
            <h4 className="modal-section-title">{t.itemsOrdered}</h4>
            <div className="modal-items-list">
              {order.items.map((item, idx) => {
                const itemName = language === 'te' ? (item.nameTe || item.nameEn || item.name) : (item.nameEn || item.name);
                return (
                <div key={idx} className="modal-item-card">
                  <div className="modal-item-image">
                    <img 
                      src={item.imageUrl || 'https://via.placeholder.com/60'} 
                      alt={itemName}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                    />
                  </div>
                  <div className="modal-item-details">
                    <h5 className="modal-item-name">{itemName}</h5>
                    <p className="modal-item-weight">{item.weight}</p>
                    <p className="modal-item-quantity">{t.qty}: {item.quantity}</p>
                  </div>
                  <div className="modal-item-price">
                    <IndianRupee className="w-4 h-4" />
                    {(item.price * item.quantity).toFixed(0)}
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          <div className="modal-total-section">
            <span className="modal-total-label">{t.orderTotal}</span>
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
