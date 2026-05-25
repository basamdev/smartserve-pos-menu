const CACHE_NAME = 'ali-cafe-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/menu.html',
    '/admin.html',
    '/login.html',
    '/css/style.css',
    '/css/admin.css',
    '/css/login.css',
    '/js/firebase.js',
    '/js/app.js',
    '/js/admin.js',
    '/js/login.js',
    '/images/ali-cafe-logo-circular.png',
    '/images/ali-cafe-app-icon.png',
    '/manifest.json'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) { return key !== CACHE_NAME; })
                    .map(function (key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (event) {
    var request = event.request;
    if (request.method !== 'GET') return;

    var url = new URL(request.url);

    if (url.hostname === 'firestore.googleapis.com' || url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('flaticon') || url.hostname.includes('unsplash') || url.hostname.includes('gstatic')) {
        event.respondWith(
            fetch(request).then(function (response) {
                if (response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) { cache.put(request, clone); });
                }
                return response;
            }).catch(function () {
                return caches.match(request);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(request).then(function (cached) {
            if (cached) return cached;
            return fetch(request).then(function (response) {
                if (response.ok && (url.origin === self.location.origin || url.hostname.includes('fonts'))) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) { cache.put(request, clone); });
                }
                return response;
            }).catch(function () {
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('', { status: 503, statusText: 'Offline' });
            });
        })
    );
});
