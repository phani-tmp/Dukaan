import React from 'react';
import { Package, IndianRupee, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { translations } from '../../constants/translations';

const OrdersView = ({ orders, language, setSelectedOrder }) => {
  const t = translations[language];

  const activeOrders = orders.filter(order => order.status !== 'delivered');

  if (activeOrders.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" />
        <p className="empty-text">No active orders</p>
      </div>
    );
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: t.orderPlaced || 'Pending',
      accepted: 'Accepted',
      out_for_delivery: 'Out for Delivery',
      delivered: t.delivered || 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') return <CheckCircle className="w-5 h-5" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5" />;
    if (status === 'out_for_delivery') return <Truck className="w-5 h-5" />;
    if (status === 'accepted') return <CheckCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'accepted': return '#2196F3';
      case 'out_for_delivery': return '#FF9800';
      case 'cancelled': return '#f44336';
      case 'pending': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="orders-view">
      <h2 className="view-title">Active Orders</h2>
      <div className="orders-list">
        {activeOrders.map(order => (
          <div key={order.id} className="order-card-detailed">
            <div className="order-header-detailed">
              <div className="order-info-row">
                <div className="order-meta">
                  <span className="order-date-label">Order Date</span>
                  <span className="order-date-value">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>

            <div className="order-items-detailed">
              {order.items.map((item, idx) => {
                console.log('[Order Item Debug]', {
                  name: item.name,
                  hasImageUrl: !!item.imageUrl,
                  imageUrl: item.imageUrl,
                  weight: item.weight
                });
                return (
                  <div key={idx} className="order-item-card">
                    <div className="order-item-image">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/80?text=No+Image'} 
                        alt={item.name}
                        onError={(e) => {
                          console.log('[Image Error]', item.name, 'failed to load:', item.imageUrl);
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="order-item-details">
                      <h4 className="order-item-name">{item.name}</h4>
                      <p className="order-item-weight">{item.weight || 'N/A'}</p>
                      <div className="order-item-pricing">
                        <span className="order-item-quantity">Qty: {item.quantity}</span>
                        <span className="order-item-price">
                          <IndianRupee className="w-3 h-3" />
                          {item.price.toFixed(0)} each
                        </span>
                      </div>
                    </div>
                    <div className="order-item-total">
                      <IndianRupee className="w-4 h-4" />
                      {(item.price * item.quantity).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === 'cancelled' && order.cancellationReason && (
              <div className="order-cancellation-section">
                <div className="cancellation-badge">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="cancellation-label">Cancellation Reason:</span>
                </div>
                <p className="cancellation-reason-text">{order.cancellationReason}</p>
              </div>
            )}

            <div className="order-footer-detailed">
              <div className="order-total-row">
                <span className="order-total-label">Order Total</span>
                <span className="order-total-amount">
                  <IndianRupee className="w-5 h-5" />
                  {order.total.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersView;
