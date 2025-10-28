import React from 'react';
import { Home, Package, ShoppingCart, User } from 'lucide-react';
import { translations } from '../../constants/translations';

const BottomNavigation = ({ currentView, setCurrentView, cartItems, language }) => {
  const t = translations[language];
  const totalItems = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: t.home, icon: Home, view: 'Home' },
    { name: t.orders, icon: Package, view: 'Orders' },
    { name: t.cart, icon: ShoppingCart, view: 'Cart', badge: totalItems },
    { name: t.profile, icon: User, view: 'Profile' },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.view}
          onClick={() => setCurrentView(item.view)}
          className={`nav-item ${currentView === item.view ? 'nav-item-active' : ''}`}
        >
          <div className="nav-icon-wrapper">
            <item.icon className="w-6 h-6" />
            {item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </div>
          <span className="nav-label">{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
