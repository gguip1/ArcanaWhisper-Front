import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
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

// Kakao SDK 타입 정의
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: { success: (response: any) => void; fail: (error: any) => void }) => void;
        getStatusInfo: (callback: (status: any) => void) => void;
        logout: () => void;
      };
      API: {
        request: (options: any) => Promise<any>;
      }
    };
  }
}

// 지원되는 소셜 로그인 제공자 타입
export type AuthProvider = 
  | 'google'
  | 'facebook'
  | 'github'
  | 'kakao'
  | 'microsoft'
  | 'apple';

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
const auth = getAuth(app);

class AuthService {
  private _currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    // Kakao SDK 초기화
    this.initKakaoSdk();
    
    // Firebase 인증 상태 변경 감지
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this._currentUser = this.parseUserData(user);
        // 로그인 성공 시 사용자 정보 로깅
        console.log('🔐 로그인 성공:', this._currentUser);
        this.notifyListeners();
      } else {
        // Firebase에서 로그아웃되었지만 카카오는 별도 확인 필요
        if (this._currentUser?.provider !== 'kakao') {
          this._currentUser = null;
          this.notifyListeners();
        }
        this.checkKakaoLoginStatus();
      }
    });
  }

  // Kakao SDK 로드 및 초기화
  private initKakaoSdk(): void {
    const kakaoKey = import.meta.env.VITE_KAKAO_API_KEY;
    if (!kakaoKey) return;
    
    if (!document.getElementById('kakao-sdk')) {
      const script = document.createElement('script');
      script.id = 'kakao-sdk';
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey);
          this.checkKakaoLoginStatus();
        }
      };
      document.head.appendChild(script);
    } else if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
      this.checkKakaoLoginStatus();
    }
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

  // Kakao 로그인 상태 확인
  private checkKakaoLoginStatus(): void {
    if (!window.Kakao?.Auth) return;
    
    window.Kakao.Auth.getStatusInfo((status: any) => {
      if (status.status === 'connected') {
        window.Kakao.API.request({
          url: '/v2/user/me',
        }).then((res) => {
          this._currentUser = {
            uid: `kakao:${res.id}`,
            displayName: res.properties?.nickname || null,
            email: res.kakao_account?.email || null,
            photoURL: res.properties?.profile_image || null,
            provider: 'kakao'
          };
        //   // 카카오 로그인 성공 시 사용자 정보 로깅
        //   console.log('🔐 카카오 로그인 성공:', this._currentUser);
          this.notifyListeners();
        }).catch(console.error);
      } else if (this._currentUser?.provider === 'kakao') {
        this._currentUser = null;
        this.notifyListeners();
      }
    });
  }

  // 소셜 로그인 처리
  async signIn(provider: AuthProvider): Promise<UserProfile> {
    try {
      // 카카오 로그인 처리
      if (provider === 'kakao') {
        const user = await this.signInWithKakao();
        console.log(`🔐 ${provider} 로그인 완료:`, user);
        return user;
      }
      
      // Firebase 로그인 처리
      let authProvider;
      switch (provider) {
        case 'google':
          authProvider = new GoogleAuthProvider();
          break;
        case 'facebook':
          authProvider = new FacebookAuthProvider();
          break;
        case 'github':
          authProvider = new GithubAuthProvider();
          break;
        case 'microsoft':
          authProvider = new OAuthProvider('microsoft.com');
          break;
        case 'apple':
          authProvider = new OAuthProvider('apple.com');
          break;
        default:
          throw new Error(`지원하지 않는 로그인 제공자: ${provider}`);
      }
      
      const result = await signInWithPopup(auth, authProvider);
      this._currentUser = this.parseUserData(result.user);
      console.log(`🔐 ${provider} 로그인 완료:`, this._currentUser);
      this.notifyListeners();
      return this._currentUser;
    } catch (error) {
      console.error(`❌ 로그인 실패 (${provider}):`, error);
      throw error;
    }
  }

  // 카카오 로그인 처리
  private signInWithKakao(): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      if (!window.Kakao?.Auth) {
        reject(new Error('Kakao SDK가 로드되지 않았습니다'));
        return;
      }
      
      window.Kakao.Auth.login({
        success: () => {
          window.Kakao.API.request({
            url: '/v2/user/me',
          })
          .then((res) => {
            const userData = {
              uid: `kakao:${res.id}`,
              displayName: res.properties?.nickname || null,
              email: res.kakao_account?.email || null,
              photoURL: res.properties?.profile_image || null,
              provider: 'kakao'
            };
            this._currentUser = userData;
            this.notifyListeners();
            resolve(userData);
          })
          .catch(reject);
        },
        fail: reject
      });
    });
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      const currentProvider = this._currentUser?.provider;
      
      // Firebase 로그아웃
      await firebaseSignOut(auth);
      
      // 카카오 로그아웃 (카카오로 로그인한 경우)
      if (currentProvider === 'kakao' && window.Kakao?.Auth) {
        window.Kakao.Auth.logout();
      }
      
      this._currentUser = null;
      this.notifyListeners();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      throw error;
    }
  }

  // 현재 사용자 정보
  get currentUser(): UserProfile | null {
    return this._currentUser;
  }

  // 로그인 상태 확인
  get isLoggedIn(): boolean {
    return this._currentUser !== null;
  }

  // 인증 상태 변경 구독
  subscribe(listener: (user: UserProfile | null) => void): () => void {
    this.listeners.push(listener);
    
    // 현재 상태 즉시 통지
    listener(this._currentUser);
    
    // 구독 취소 함수 반환
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 모든 리스너에게 변경 알림
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this._currentUser));
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();
export default authService;
