import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 앱 시작 시 인증 서비스 초기화
import './services/authService'

// 오프라인 상태 감지 및 처리
window.addEventListener('online', () => {
  document.body.classList.remove('offline-mode');
  // 오프라인 모드에서 온라인으로 전환되었을 때 사용자에게 알림
  if (window.offlineNotification) {
    window.offlineNotification.style.display = 'none';
  }
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline-mode');
  
  // 오프라인 모드로 전환되었을 때 사용자에게 알림
  if (!window.offlineNotification) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                  background-color: rgba(156, 39, 176, 0.9); color: white; padding: 10px 20px; 
                  border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); z-index: 9999;">
        인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.
      </div>
    `;
    document.body.appendChild(notification);
    window.offlineNotification = notification;
  } else {
    window.offlineNotification.style.display = 'block';
  }
});

// 초기 로드 시 오프라인 상태 확인
if (!navigator.onLine) {
  document.body.classList.add('offline-mode');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
