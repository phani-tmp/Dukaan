import React, { useState } from 'react';
import { User, Package, IndianRupee, LogOut, MapPin, ChevronLeft, Edit2, Save, X, Store, Bike } from 'lucide-react';
import { translations } from '../../constants/translations';
import { doc, updateDoc } from 'firebase/firestore';
import { getFirebaseInstances, appId } from '../../services/firebase';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || ''
  });

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const handleEditClick = () => {
    setEditForm({
      name: userProfile?.name || '',
      email: userProfile?.email || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: userProfile?.name || '',
      email: userProfile?.email || ''
    });
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!userProfile || !userProfile.id) {
      alert('User profile not found');
      return;
    }

    try {
      const { db } = getFirebaseInstances();
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', userProfile.id);
      await updateDoc(userRef, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        updatedAt: new Date().toISOString()
      });
      
      setIsEditing(false);
      alert('Profile updated successfully! Please refresh to see changes.');
      window.location.reload(); // Refresh to get updated profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="profile-view">
      <h2 className="view-title">{t.profile}</h2>
      
      <div className="profile-info">
        <div className="profile-avatar">
          <User className="w-12 h-12" />
        </div>
        {userProfile ? (
          isEditing ? (
            <div className="profile-edit-form">
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter your name"
                className="profile-edit-input"
              />
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Enter your email (optional)"
                className="profile-edit-input"
              />
              <div className="profile-edit-actions">
                <button onClick={handleSaveProfile} className="profile-save-btn">
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button onClick={handleCancelEdit} className="profile-cancel-btn">
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <div className="profile-info-text">
                <p className="profile-name">{userProfile.name}</p>
                <p className="profile-phone">{userProfile.phoneNumber}</p>
                {userProfile.email && <p className="profile-email">{userProfile.email}</p>}
              </div>
              <button onClick={handleEditClick} className="profile-edit-btn">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )
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
            <p className="stat-value">₹{Math.round(totalSpent * 0.15)}</p>
            <p className="stat-label">Money Saved</p>
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

      <div className="profile-section">
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#666' }}>
          Switch Mode
        </h3>
        <button 
          className="order-history-button"
          onClick={() => window.location.href = '?mode=shopkeeper'}
          style={{ marginBottom: '8px' }}
        >
          <Store className="w-5 h-5" />
          <span>Shopkeeper Dashboard</span>
          <ChevronLeft className="w-5 h-5" style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button 
          className="order-history-button"
          onClick={() => window.location.href = '?mode=rider'}
        >
          <Bike className="w-5 h-5" />
          <span>Rider Dashboard</span>
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
