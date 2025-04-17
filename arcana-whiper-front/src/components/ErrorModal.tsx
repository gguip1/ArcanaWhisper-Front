import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal" onClick={e => e.stopPropagation()}>
        <button className="error-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">오류가 발생했습니다</h2>
        <p className="error-message">{message}</p>
        <button className="error-action-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
