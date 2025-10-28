import React, { useEffect } from 'react';
import { CheckCircle, Package, X } from 'lucide-react';

const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        {type === 'info' && <Package className="w-5 h-5" />}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="toast-close">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastNotification;
