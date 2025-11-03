import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../../services/firebase';
import { translations } from '../../constants/translations';
import { 
  MapPin, 
  Phone, 
  Package, 
  Truck, 
  CheckCircle, 
  ChevronLeft, 
  Clock,
  User,
  Navigation,
  Store,
  Home
} from 'lucide-react';

const RiderDashboard = ({ rider, allOrders, language, onExit }) => {
  const { db } = getFirebaseInstances();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('pending');

  // Filter only delivery orders assigned to this rider (SECURITY: only show assigned orders)
  const assignedOrders = allOrders.filter(order => 
    order.deliveryMethod === 'delivery' && order.riderId === rider.id
  );

  // Categorize orders for rider
  const pendingOrders = assignedOrders.filter(order => 
    order.status === 'ready_for_pickup' || order.status === 'accepted'
  );
  const activeDeliveries = assignedOrders.filter(order => 
    order.status === 'out_for_delivery'
  );
  const completedOrders = assignedOrders.filter(order => 
    order.status === 'delivered'
  );

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      alert(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handlePickupOrder = async (orderId) => {
    if (window.confirm('Mark this order as picked up and out for delivery?')) {
      try {
        const orderRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
        await updateDoc(orderRef, {
          status: 'out_for_delivery',
          riderId: rider.id,
          riderName: rider.name,
          riderPhone: rider.phone,
          updatedAt: new Date().toISOString()
        });
        alert('Order picked up! Now out for delivery.');
      } catch (error) {
        console.error('Error picking up order:', error);
        alert('Failed to pick up order. Please try again.');
      }
    }
  };

  const handleDeliverOrder = (orderId) => {
    if (window.confirm('Confirm that this order has been delivered?')) {
      handleUpdateStatus(orderId, 'delivered');
    }
  };

  const getOrdersToDisplay = () => {
    if (activeTab === 'pending') return pendingOrders;
    if (activeTab === 'active') return activeDeliveries;
    return completedOrders;
  };

  const ordersToDisplay = getOrdersToDisplay();

  return (
    <div className="rider-dashboard">
      <div className="rider-header">
        <button onClick={onExit} className="back-btn">
          <ChevronLeft className="w-5 h-5" />
          Exit Rider Mode
        </button>
        <div>
          <h1 className="rider-title">
            <Truck className="w-6 h-6" />
            Rider Dashboard
          </h1>
          <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
            Welcome, {rider.name}!
          </p>
        </div>
      </div>

      <div className="rider-stats">
        <div className="stat-card">
          <div className="stat-icon pending-bg">
            <Clock className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{pendingOrders.length}</div>
            <div className="stat-label">Ready to Pickup</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active-bg">
            <Truck className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeDeliveries.length}</div>
            <div className="stat-label">Out for Delivery</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon delivered-bg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{completedOrders.length}</div>
            <div className="stat-label">Delivered Today</div>
          </div>
        </div>
      </div>

      <div className="rider-tabs">
        <button 
          className={`rider-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="w-4 h-4" />
          Ready to Pickup ({pendingOrders.length})
        </button>
        <button 
          className={`rider-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <Truck className="w-4 h-4" />
          Out for Delivery ({activeDeliveries.length})
        </button>
        <button 
          className={`rider-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircle className="w-4 h-4" />
          Delivered ({completedOrders.length})
        </button>
      </div>

      <div className="rider-orders-list">
        {ordersToDisplay.length === 0 ? (
          <div className="no-orders-message">
            <Package className="w-12 h-12 text-gray-400" />
            <p>No orders in this category</p>
          </div>
        ) : (
          ordersToDisplay.map(order => (
            <div key={order.id} className="rider-order-card">
              <div className="rider-order-header">
                <div className="order-id-section">
                  <Package className="w-4 h-4" />
                  <span className="order-id-text">Order #{order.id.slice(-6)}</span>
                </div>
                <div className="order-total-section">
                  <span className="total-label-small">Total</span>
                  <span className="total-amount-rider">₹{order.total.toFixed(0)}</span>
                </div>
              </div>

              <div className="rider-customer-info">
                <div className="customer-detail">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="customer-name">{order.customerName}</span>
                </div>
                <a href={`tel:${order.customerPhone}`} className="customer-phone-link">
                  <Phone className="w-4 h-4" />
                  {order.customerPhone}
                </a>
              </div>

              <div className="rider-delivery-address">
                <div className="address-header-rider">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="address-label-rider">Delivery Address</span>
                </div>
                <p className="address-text-rider">{order.deliveryAddress}</p>
                {order.deliveryInstructions && (
                  <p className="delivery-instructions-rider">
                    <strong>Instructions:</strong> {order.deliveryInstructions}
                  </p>
                )}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navigate-btn"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </a>
              </div>

              <div className="rider-order-items">
                <div className="items-count-badge">
                  <Package className="w-4 h-4" />
                  {order.items.length} items
                </div>
                <div className="items-preview">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="item-preview-text">
                      {item.name} x{item.quantity}
                      {idx < Math.min(order.items.length, 3) - 1 && ', '}
                    </span>
                  ))}
                  {order.items.length > 3 && <span className="more-items">+{order.items.length - 3} more</span>}
                </div>
              </div>

              {activeTab === 'pending' && (
                <button 
                  onClick={() => handlePickupOrder(order.id)}
                  className="rider-action-btn pickup-btn"
                >
                  <Truck className="w-4 h-4" />
                  Pick Up & Start Delivery
                </button>
              )}

              {activeTab === 'active' && (
                <button 
                  onClick={() => handleDeliverOrder(order.id)}
                  className="rider-action-btn deliver-btn"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Delivered
                </button>
              )}

              {activeTab === 'completed' && (
                <div className="delivered-stamp">
                  <CheckCircle className="w-5 h-5" />
                  Delivered
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '24px', padding: '0 16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#666' }}>
          Switch Mode
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '14px 20px',
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            <Home className="w-5 h-5" />
            <span>Customer App</span>
          </button>
          <button 
            onClick={() => window.location.href = '?mode=shopkeeper'}
            style={{
              padding: '14px 20px',
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            <Store className="w-5 h-5" />
            <span>Shopkeeper Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
