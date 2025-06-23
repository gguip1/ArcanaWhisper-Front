import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
