export const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusColor = (status) => {
  const colors = {
    pending: '#FF9800',
    accepted: '#2196F3',
    'out for delivery': '#9C27B0',
    delivered: '#4CAF50',
    cancelled: '#F44336'
  };
  return colors[status?.toLowerCase()] || '#999';
};

export const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'status-pending',
    accepted: 'status-accepted',
    'out for delivery': 'status-out-for-delivery',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  };
  return classes[status?.toLowerCase()] || 'status-default';
};
