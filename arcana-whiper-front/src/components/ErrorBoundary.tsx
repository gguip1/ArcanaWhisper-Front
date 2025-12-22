import { Component, ReactNode } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import '../styles/ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 에러 로깅 (프로덕션에서는 외부 서비스로 전송 가능)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <FaExclamationTriangle />
            </div>

            <h1 className="error-boundary-title">
              문제가 발생했습니다
            </h1>

            <p className="error-boundary-message">
              예기치 않은 오류가 발생했습니다.
              <br />
              잠시 후 다시 시도해주세요.
            </p>

            {this.state.error && (
              <details className="error-boundary-details">
                <summary>오류 상세 정보</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                className="error-boundary-button primary"
                onClick={this.handleReload}
              >
                <FaRedo className="button-icon" />
                새로고침
              </button>

              <button
                className="error-boundary-button secondary"
                onClick={this.handleGoHome}
              >
                <FaHome className="button-icon" />
                홈으로
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
