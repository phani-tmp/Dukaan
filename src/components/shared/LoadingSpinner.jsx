import React from 'react';

const LoadingSpinner = () => (
  <div className="flex-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <p className="ml-3 text-green-700 font-medium">Loading...</p>
  </div>
);

export default LoadingSpinner;
