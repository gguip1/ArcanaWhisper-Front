importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, createHandlerBoundToURL } = workbox.precaching;

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

// 오프라인 폴백 처리
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});

// 서비스 워커가 설치될 때 필요한 리소스를 캐시
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 서비스 워커가 활성화될 때 필요한 작업 수행
self.addEventListener('activate', (event) => {
  self.clients.claim();
});
