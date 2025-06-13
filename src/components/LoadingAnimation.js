import React from 'react';

const LoadingAnimation = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="circular-loading">
        <div className="progress-ring">
          <div className="progress-ring-circle"></div>
          <div className="progress-ring-circle"></div>
          <div className="progress-ring-circle"></div>
        </div>
        <div className="sync-icon">
          <i className="fas fa-sync-alt"></i>
        </div>
      </div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingAnimation; 