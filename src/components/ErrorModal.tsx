import { useEffect, useState, FC } from 'react';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';
import errorService from '../services/errorService';
import '../styles/ErrorModal.css';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: FC<ErrorModalProps> = ({ message, onClose }) => {
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
          <FaExclamationCircle className="error-icon" />
          <h3>오류</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
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
export const GlobalErrorModal: FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
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
