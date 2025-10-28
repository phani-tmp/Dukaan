import React from 'react';
import { User, Package, IndianRupee, LogOut, MapPin, ChevronLeft } from 'lucide-react';
import { translations } from '../../constants/translations';

const ProfileView = ({ 
  userProfile, 
  orders, 
  onLogout, 
  language, 
  setCurrentView, 
  userAddresses, 
  onManageAddresses 
}) => {
  const t = translations[language];

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="profile-view">
      <h2 className="view-title">{t.profile}</h2>
      
      <div className="profile-info">
        <div className="profile-avatar">
          <User className="w-12 h-12" />
        </div>
        {userProfile ? (
          <div>
            <p className="profile-name">{userProfile.name}</p>
            <p className="profile-phone">{userProfile.phoneNumber}</p>
          </div>
        ) : (
          <p className="profile-id">Loading profile...</p>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <Package className="w-6 h-6 text-green-600" />
          <div>
            <p className="stat-value">{totalOrders}</p>
            <p className="stat-label">{t.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <IndianRupee className="w-6 h-6 text-green-600" />
          <div>
            <p className="stat-value">₹{totalSpent.toFixed(0)}</p>
            <p className="stat-label">{t.totalSpent}</p>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <button 
          className="order-history-button"
          onClick={onManageAddresses}
        >
          <MapPin className="w-5 h-5" />
          <span>Manage Addresses ({userAddresses.length})</span>
          <ChevronLeft className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <div className="profile-section">
        <button 
          className="order-history-button"
          onClick={() => setCurrentView('OrderHistory')}
        >
          <Package className="w-5 h-5" />
          <span>View Order History ({totalOrders})</span>
          <ChevronLeft className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <button onClick={onLogout} className="logout-button">
        <LogOut className="w-5 h-5" />
        {t.logout}
      </button>
    </div>
  );
};

export default ProfileView;
