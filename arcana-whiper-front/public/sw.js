importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, createHandlerBoundToURL } = workbox.precaching;

// 서비스 워커 버전 (업데이트할 때마다 변경)
const CACHE_VERSION = 'v1';

// 캐시할 정적 자원
const STATIC_CACHE = `arcanawhisper-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `arcanawhisper-dynamic-${CACHE_VERSION}`;

// 오프라인 페이지 URL
const OFFLINE_URL = '/offline.html';

// 필수 캐시 자원
const REQUIRED_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon-196.png',
  '/apple-icon-180.png'
];

// 자동 생성된 프리캐시 매니페스트 대신 수동으로 중요 파일들을 프리캐시
self.__WB_MANIFEST = [
  { url: '/', revision: '1' },
  { url: '/index.html', revision: '1' },
  { url: '/manifest.webmanifest', revision: '1' },
  { url: '/crystalball-svgrepo-com.svg', revision: '1' },
  { url: '/offline.html', revision: '1' }
];

precacheAndRoute(self.__WB_MANIFEST);

// HTML 네비게이션 요청을 위한 기본 핸들러로 index.html 설정
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    // 내비게이션 요청인지 확인
    if (request.mode !== 'navigate') {
      return false;
    }
    
    // URL에 파일 확장자가 있는지 확인
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    return true;
  },
  createHandlerBoundToURL('/index.html')
);

// 이미지는 캐시 우선 전략 사용
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
      }),
    ],
  })
);

// 스크립트, CSS, 웹 폰트는 StaleWhileRevalidate 전략 사용
registerRoute(
  ({ request }) => 
    request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// API 요청에 대해서는 NetworkFirst 전략 사용
registerRoute(
  ({ url }) => url.origin === 'https://api.arcanawhisper.com' || url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24시간
      }),
    ],
  })
);

// 설치 시 필수 파일 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: 정적 파일 캐싱 중...');
        return cache.addAll(REQUIRED_FILES);
      })
      .then(() => self.skipWaiting()) // 기존 서비스 워커 즉시 활성화
  );
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
          console.log('Service Worker: 이전 캐시 삭제', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim()) // 현재 열린 페이지 즉시 제어
  );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
  // HTML 페이지 요청 시 네트워크 우선, 실패하면 오프라인 페이지
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(STATIC_CACHE)
            .then(cache => cache.match(OFFLINE_URL));
        })
    );
    return;
  }
  
  // 이미지, 스크립트, 스타일 등의 정적 자원
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request.url, fetchResponse.clone());
            return fetchResponse;
          });
        });
      }).catch(() => {
        // 이미지 요청 실패 시 기본 이미지 반환 가능
        if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
          return caches.match('/icon-192.png');
        }
        return new Response('Resource not found', { status: 404 });
      })
    );
    return;
  }
  
  // API 요청은 네트워크 우선, 실패하면 캐시 (GET 요청만 캐시)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // GET 요청이고 응답이 성공적일 때만 캐시에 저장
        if (event.request.method === 'GET' && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// 백그라운드 동기화 (오프라인 상태에서 작업 큐)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reading-history') {
    console.log('Attempting to sync reading history');
    event.waitUntil(syncReadingHistory());
  }
});

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon-196.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
