import React from 'react';
import { ChevronLeft, Package } from 'lucide-react';

const OrderHistoryView = ({ orders, onBack, onSelectOrder, language, translations }) => {
  const t = translations[language];

  return (
    <div className="order-history-view">
      <div className="view-header">
        <button onClick={onBack} className="back-button">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="view-title">Order History</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <Package className="empty-icon" />
          <p className="empty-text">{t.noOrders}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="order-history-item clickable"
              onClick={() => onSelectOrder(order)}
            >
              <div className="order-history-info">
                <p className="order-history-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
                <p className="order-history-items">
                  {order.items.length} items • {order.status}
                </p>
              </div>
              <div className="order-history-right">
                <p className="order-history-price">₹{order.total.toFixed(0)}</p>
                <ChevronLeft className="chevron-icon" style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryView;
