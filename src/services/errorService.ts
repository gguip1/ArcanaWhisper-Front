/**
 * 전역 에러 처리 서비스
 */

type ErrorSubscriber = (message: string | null) => void;
type ErrorCleanupFn = () => void;
type ErrorCallback = () => void;

/**
 * 애플리케이션 전체에서 사용할 에러 처리 서비스
 */
class ErrorService {
  private currentError: string | null = null;
  private subscribers: ErrorSubscriber[] = [];
  private autoHideTimeout: number | null = null;
  private onCloseCallback: ErrorCallback | null = null;
  
  /**
   * 에러 메시지 표시
   * @param message 에러 메시지
   * @param duration 자동으로 사라지는 시간(ms), 0이면 자동으로 사라지지 않음
   * @param onClose 에러 메시지가 닫힌 후 실행할 콜백
   */
  showError(message: string, duration = 5000, onClose?: ErrorCallback): void {
    this.clearAutoHide();
    this.currentError = message;
    this.onCloseCallback = onClose || null;
    this.notifySubscribers();
    
    if (duration > 0) {
      this.autoHideTimeout = window.setTimeout(() => {
        this.hideError();
      }, duration);
    }
    
    // 콘솔에도 에러 출력
    console.error('🔴 앱 에러:', message);
  }
  
  /**
   * 에러 메시지 숨기기
   */
  hideError(): void {
    this.clearAutoHide();
    this.currentError = null;
    this.notifySubscribers();
    
    // 콜백이 있으면 실행
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }
  }
  
  /**
   * 자동 숨김 타이머 제거
   */
  private clearAutoHide(): void {
    if (this.autoHideTimeout !== null) {
      clearTimeout(this.autoHideTimeout);
      this.autoHideTimeout = null;
    }
  }
  
  /**
   * 현재 표시 중인 에러 메시지
   */
  get currentErrorMessage(): string | null {
    return this.currentError;
  }
  
  /**
   * 에러 상태 변경 구독
   * @param subscriber 변경 시 호출할 함수
   * @returns 구독 취소 함수
   */
  subscribe(subscriber: ErrorSubscriber): ErrorCleanupFn {
    this.subscribers.push(subscriber);
    
    // 현재 상태 즉시 알림
    subscriber(this.currentError);
    
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== subscriber);
    };
  }
  
  /**
   * 모든 구독자에게 상태 변경 알림
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(subscriber => {
      subscriber(this.currentError);
    });
  }
}

// 싱글톤 인스턴스
const errorService = new ErrorService();
export default errorService;
