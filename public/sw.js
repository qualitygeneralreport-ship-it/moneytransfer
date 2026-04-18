const CACHE_NAME = 'mtms-v2'; // Version update လုပ်ခြင်းဖြင့် assets အသစ်များကို cache လုပ်စေမည်
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Google Apps Script သို့မဟုတ် ပြင်ပ API requests များကို Service Worker မှ ကျော်သွားစေရန်
  if (event.request.url.includes('google.com') || event.request.url.includes('googleusercontent.com')) {
    return; // Browser network stack ထံ တိုက်ရိုက်လွှတ်ပေးမည်
  }

  // GET requests များကိုသာ cache နှင့် handle လုပ်မည်
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});