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

// 로컬 스토리지 키 정의
const USER_STORAGE_KEY = 'arcana_whisper_user';

class AuthService {
  private currentUserProfile: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    // Kakao SDK 초기화
    this.initKakaoSdk();
    
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
        this.saveUser(userProfile); // 로컬 스토리지에 저장
      } else {
        if (this.currentUserProfile?.provider !== 'kakao') {
          this.currentUserProfile = null;
          this.clearSavedUser(); // 로컬 스토리지에서 삭제
        }
        this.checkKakaoLoginStatus();
      }
      
      this.notifyListeners();
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
          this.currentUserProfile = {
            uid: `kakao:${res.id}`,
            displayName: res.properties?.nickname || null,
            email: res.kakao_account?.email || null,
            photoURL: res.properties?.profile_image || null,
            provider: 'kakao'
          };
          this.saveUser(this.currentUserProfile); // 로컬 스토리지에 저장
          this.notifyListeners();
        }).catch(console.error);
      } else if (this.currentUserProfile?.provider === 'kakao') {
        this.currentUserProfile = null;
        this.clearSavedUser(); // 로컬 스토리지에서 삭제
        this.notifyListeners();
      }
    });
  }

  // 사용자 정보 로컬 스토리지 저장
  private saveUser(user: UserProfile): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
    }
  }

  // 로컬 스토리지에서 사용자 정보 불러오기
  private getSavedUser(): UserProfile | null {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('저장된 사용자 정보 로드 실패:', error);
      return null;
    }
  }

  // 로컬 스토리지에서 사용자 정보 삭제
  private clearSavedUser(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('사용자 정보 삭제 실패:', error);
    }
  }

  // 소셜 로그인 처리
  async signIn(provider: AuthProvider): Promise<UserProfile> {
    try {
      if (provider === 'kakao') {
        const user = await this.signInWithKakao();
        return user;
      }
      
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
      this.currentUserProfile = this.parseUserData(result.user);
      this.saveUser(this.currentUserProfile); // 로컬 스토리지에 저장
      this.notifyListeners();
      return this.currentUserProfile;
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
            this.currentUserProfile = userData;
            this.saveUser(userData); // 로컬 스토리지에 저장
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
      const currentProvider = this.currentUserProfile?.provider;
      
      await firebaseSignOut(auth);
      
      if (currentProvider === 'kakao' && window.Kakao?.Auth) {
        window.Kakao.Auth.logout();
      }
      
      this.currentUserProfile = null;
      this.clearSavedUser(); // 로컬 스토리지에서 삭제
      this.notifyListeners();
    } catch (error) {
      console.error('로그아웃 실패:', error);
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
