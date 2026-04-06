import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 지원되는 소셜 로그인 제공자 타입
export type AuthProvider = 'google';

// 사용자 프로필 인터페이스
export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string;
}

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 로컬 스토리지 키 정의
const USER_STORAGE_KEY = 'arcana_whisper_user';

class AuthService {
  private currentUserProfile: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];
  private authInitialized: boolean = false;
  private authReadyPromise: Promise<void>;
  private authReadyResolve: (() => void) | null = null;

  constructor() {
    // Auth 초기화 완료 Promise 생성
    this.authReadyPromise = new Promise((resolve) => {
      this.authReadyResolve = resolve;
    });

    // 로컬 스토리지에서 사용자 정보 복원
    const savedUser = this.getSavedUser();
    if (savedUser) {
      this.currentUserProfile = savedUser;
    }

    // Firebase 인증 상태 변경 감지
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          provider: user.providerData[0]?.providerId || 'unknown',
        };

        this.currentUserProfile = userProfile;
        this.saveUser(userProfile);
      } else {
        // 초기화 완료 후에만 null 처리 (세션 복원 대기)
        if (this.authInitialized) {
          this.currentUserProfile = null;
          this.clearSavedUser();
        }
      }

      // 첫 번째 콜백에서 초기화 완료 표시
      if (!this.authInitialized) {
        this.authInitialized = true;
        this.authReadyResolve?.();
      }

      this.notifyListeners();
    });
  }

  // Auth 초기화 완료 대기
  async waitForAuthReady(): Promise<void> {
    return this.authReadyPromise;
  }

  // Firebase 사용자 데이터 파싱
  private parseUserData(user: User): UserProfile {
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      provider: user.providerData[0]?.providerId || 'unknown'
    };
  }

  // 사용자 정보 로컬 스토리지 저장
  private saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      // 저장 실패 시 무시
    }
  }

  // 로컬 스토리지에서 사용자 정보 불러오기
  private getSavedUser(): UserProfile | null {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  }

  // 로컬 스토리지에서 사용자 정보 삭제
  private clearSavedUser(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      // 삭제 실패 시 무시
    }
  }

  // Google 로그인 처리
  async signIn(provider: AuthProvider): Promise<UserProfile> {
    if (provider !== 'google') {
      throw new Error(`지원하지 않는 로그인 제공자: ${provider}`);
    }

    const authProvider = new GoogleAuthProvider();

    // 팝업 창 닫힘 감지를 위한 Promise 래핑
    return new Promise((resolve, reject) => {
      let popupCheckInterval: ReturnType<typeof setInterval> | null = null;
      let isResolved = false;

      // 팝업 창 참조를 얻기 위해 window.open 이벤트 감지
      const originalOpen = window.open;
      let popupWindow: Window | null = null;

      window.open = function(...args) {
        popupWindow = originalOpen.apply(this, args);
        return popupWindow;
      };

      // 팝업 닫힘 체크 (200ms 간격)
      popupCheckInterval = setInterval(() => {
        if (popupWindow && popupWindow.closed && !isResolved) {
          isResolved = true;
          clearInterval(popupCheckInterval!);
          window.open = originalOpen;
          reject(new Error('LOGIN_CANCELLED'));
        }
      }, 200);

      signInWithPopup(auth, authProvider)
        .then((result) => {
          if (!isResolved) {
            isResolved = true;
            if (popupCheckInterval) clearInterval(popupCheckInterval);
            window.open = originalOpen;

            this.currentUserProfile = this.parseUserData(result.user);
            this.saveUser(this.currentUserProfile);
            this.notifyListeners();
            resolve(this.currentUserProfile);
          }
        })
        .catch((error) => {
          if (!isResolved) {
            isResolved = true;
            if (popupCheckInterval) clearInterval(popupCheckInterval);
            window.open = originalOpen;

            const firebaseError = error as { code?: string };
            if (firebaseError.code === 'auth/popup-closed-by-user' ||
                firebaseError.code === 'auth/cancelled-popup-request') {
              reject(new Error('LOGIN_CANCELLED'));
            } else {
              reject(error);
            }
          }
        });
    });
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentUserProfile = null;
      this.clearSavedUser();
      this.notifyListeners();
    } catch (error) {
      throw error;
    }
  }

  // 현재 사용자 정보
  get currentUser(): UserProfile | null {
    return this.currentUserProfile || this.getSavedUser();
  }

  // 로그인 상태 확인
  get isLoggedIn(): boolean {
    return this.currentUserProfile !== null;
  }

  // 인증 상태 변경 구독
  subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);

    listener(this.currentUserProfile);

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 모든 리스너에게 변경 알림
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUserProfile));
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();
export default authService;
