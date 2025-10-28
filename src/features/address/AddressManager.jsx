import React from 'react';
import { MapPin, PlusCircle, Edit, Trash2, X } from 'lucide-react';

const AddressManager = ({ 
  addresses, 
  onAddAddress, 
  onEditAddress, 
  onDeleteAddress, 
  onSetDefault,
  onClose
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content address-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Manage Addresses</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="address-manager-body">
          <button onClick={onAddAddress} className="add-address-btn">
            <PlusCircle className="w-5 h-5" />
            Add New Address
          </button>
          
          {addresses.length === 0 ? (
            <div className="empty-state">
              <MapPin className="w-16 h-16 text-gray-400" />
              <p>No saved addresses yet</p>
            </div>
          ) : (
            <div className="addresses-list">
              {addresses.map(address => (
                <div key={address.id} className="address-card">
                  <div className="address-card-header">
                    <div className="address-label-section">
                      <span className={`address-label-badge ${address.label.toLowerCase()}`}>
                        {address.label}
                      </span>
                      {address.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <div className="address-actions">
                      <button 
                        onClick={() => onEditAddress(address)} 
                        className="icon-btn"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteAddress(address.id)} 
                        className="icon-btn delete"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="address-card-body">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="address-text">{address.fullAddress}</p>
                  </div>
                  
                  {address.deliveryInstructions && (
                    <p className="address-instructions">
                      <strong>Instructions:</strong> {address.deliveryInstructions}
                    </p>
                  )}
                  
                  {!address.isDefault && (
                    <button 
                      onClick={() => onSetDefault(address.id)}
                      className="set-default-btn"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
