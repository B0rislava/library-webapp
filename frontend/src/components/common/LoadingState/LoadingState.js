import React from 'react';
import './LoadingState.css';

const LoadingState = ({ className = '' }) => (
  <div className={`loadingState ${className}`}>
    <div className="loadingSpinner"></div>
    <p className="loadingText">Loading...</p>
  </div>
);

export default LoadingState;