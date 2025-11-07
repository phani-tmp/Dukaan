import React, { useState } from 'react';
import { Package, IndianRupee, CheckCircle, Clock, Truck, XCircle, ShoppingBag, RefreshCw, Phone } from 'lucide-react';
import { translations } from '../../constants/translations';
import ChangeOrderTypeModal from '../../components/shared/ChangeOrderTypeModal';

const OrdersView = ({ orders, language, setSelectedOrder, onChangeDeliveryMethod, userAddresses, onManageAddresses }) => {
  const t = translations[language];
  const [changeOrderModalOpen, setChangeOrderModalOpen] = useState(false);
  const [selectedOrderForChange, setSelectedOrderForChange] = useState(null);

  const activeOrders = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'completed' && order.status !== 'cancelled'
  );

  if (activeOrders.length === 0) {
    return (
      <div className="empty-state">
        <Package className="empty-icon" />
        <p className="empty-text">{t.noActiveOrders}</p>
      </div>
    );
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: t.pending,
      accepted: t.accepted,
      out_for_delivery: t.outForDelivery,
      ready_for_pickup: t.readyForPickup,
      delivered: t.delivered,
      completed: t.completed,
      cancelled: t.cancelled
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered' || status === 'completed') return <CheckCircle className="w-5 h-5" />;
    if (status === 'cancelled') return <XCircle className="w-5 h-5" />;
    if (status === 'out_for_delivery') return <Truck className="w-5 h-5" />;
    if (status === 'ready_for_pickup') return <ShoppingBag className="w-5 h-5" />;
    if (status === 'accepted') return <CheckCircle className="w-5 h-5" />;
    return <Clock className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#4CAF50';
      case 'completed': return '#4CAF50';
      case 'accepted': return '#2196F3';
      case 'out_for_delivery': return '#FF9800';
      case 'ready_for_pickup': return '#9C27B0';
      case 'cancelled': return '#f44336';
      case 'pending': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const handleOpenChangeModal = (order) => {
    setSelectedOrderForChange(order);
    setChangeOrderModalOpen(true);
  };

  const handleConfirmChange = (newMethod, selectedAddress) => {
    if (selectedOrderForChange) {
      onChangeDeliveryMethod(selectedOrderForChange.id, newMethod, selectedAddress);
      setChangeOrderModalOpen(false);
      setSelectedOrderForChange(null);
    }
  };

  return (
    <div className="orders-view">
      <h2 className="view-title">{t.activeOrders}</h2>
      <div className="orders-list">
        {activeOrders.map(order => {
          return (
          <div key={order.id} className="order-card-detailed">
            <div className="order-header-detailed">
              <div className="order-info-row">
                <div className="order-meta">
                  <span className="order-date-label">{t.orderDate}</span>
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
                      <h4 className="order-item-name">{language === 'te' ? (item.nameTe || item.nameEn || item.name) : (item.nameEn || item.name)}</h4>
                      <p className="order-item-weight">{item.weight || 'N/A'}</p>
                      <div className="order-item-pricing">
                        <span className="order-item-quantity">{t.qty}: {item.quantity}</span>
                        <span className="order-item-price">
                          <IndianRupee className="w-3 h-3" />
                          {(item.discountedPrice ?? item.price).toFixed(0)} {t.each}
                        </span>
                      </div>
                    </div>
                    <div className="order-item-total">
                      <IndianRupee className="w-4 h-4" />
                      {((item.discountedPrice ?? item.price) * item.quantity).toFixed(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === 'cancelled' && order.cancellationReason && (
              <div className="order-cancellation-section">
                <div className="cancellation-badge">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="cancellation-label">{t.cancellationReason}:</span>
                </div>
                <p className="cancellation-reason-text">{order.cancellationReason}</p>
              </div>
            )}

            <div className="order-delivery-info">
              <div className="delivery-method-badge">
                {order.deliveryMethod === 'delivery' ? (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>{t.homeDelivery}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.storePickup}</span>
                  </>
                )}
              </div>
              {(order.status === 'pending' || order.status === 'accepted') && onChangeDeliveryMethod && (
                <button 
                  onClick={() => handleOpenChangeModal(order)}
                  className="change-delivery-btn"
                >
                  <RefreshCw className="w-4 h-4" />
                  Change Order Type
                </button>
              )}
            </div>

            {order.riderPhone && (order.status === 'out_for_delivery' || order.status === 'delivered') && (
              <div style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginTop: '12px',
                border: '1px solid #2196F3'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Truck style={{ color: '#1976D2', width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: '600', color: '#1565C0', fontSize: '14px' }}>
                    Delivery Partner
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone style={{ color: '#1976D2', width: '16px', height: '16px' }} />
                  <a 
                    href={`tel:${order.riderPhone}`}
                    style={{
                      color: '#0D47A1',
                      fontSize: '16px',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    {order.riderName || 'Delivery Partner'}: {order.riderPhone}
                  </a>
                </div>
              </div>
            )}

            <div className="order-footer-detailed">
              <div className="order-total-row">
                <span className="order-total-label">{t.orderTotal}</span>
                <span className="order-total-amount">
                  <IndianRupee className="w-5 h-5" />
                  {order.total.toFixed(0)}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {changeOrderModalOpen && selectedOrderForChange && (
        <ChangeOrderTypeModal
          isOpen={changeOrderModalOpen}
          onClose={() => {
            setChangeOrderModalOpen(false);
            setSelectedOrderForChange(null);
          }}
          onConfirm={handleConfirmChange}
          currentMethod={selectedOrderForChange.deliveryMethod}
          userAddresses={userAddresses || []}
          onManageAddresses={onManageAddresses}
        />
      )}
    </div>
  );
};

export default OrdersView;
