import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { MdError } from 'react-icons/md';
import errorService from '../services/errorService';
import '../styles/ErrorModal.css';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    // ESC 키로 모달 닫기
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal" onClick={e => e.stopPropagation()}>
        <div className="error-modal-header">
          <MdError className="error-icon" />
          <h3>오류 발생</h3>
          <button className="close-button" onClick={onClose}>
            <IoMdClose />
          </button>
        </div>
        <div className="error-modal-body">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * 전역 에러 상태를 구독하고 에러 모달을 표시하는 컴포넌트
 */
export const GlobalErrorModal: React.FC = () => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  useEffect(() => {
    // errorService 구독
    const unsubscribe = errorService.subscribe(message => {
      setErrorMessage(message);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // 에러 메시지가 없으면 아무것도 렌더링하지 않음
  if (!errorMessage) return null;
  
  return (
    <ErrorModal 
      message={errorMessage} 
      onClose={() => errorService.hideError()} 
    />
  );
};

export default ErrorModal;
