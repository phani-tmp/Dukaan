import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { User, Phone } from 'lucide-react';
import { getFirebaseInstances, appId } from '../../services/firebase';

const UsersManagement = () => {
  const { db } = getFirebaseInstances();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      usersData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div className="loading-state">Loading users...</div>;
  }

  return (
    <div className="users-section">
      <div className="section-header">
        <h3 className="section-subtitle">Registered Users</h3>
        <span className="count-badge">{users.length}</span>
      </div>
      <p className="section-description">
        All users who have registered via phone authentication.
      </p>

      {users.length === 0 ? (
        <div className="empty-state">
          <User className="empty-icon" />
          <p className="empty-text">No users registered yet</p>
        </div>
      ) : (
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-avatar">
                <User className="w-8 h-8" />
              </div>
              <div className="user-info">
                <h4 className="user-name">{user.name || 'No name'}</h4>
                <p className="user-phone">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${user.phoneNumber}`}>{user.phoneNumber}</a>
                </p>
                {user.email && <p className="user-email">{user.email}</p>}
                <p className="user-date">
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
