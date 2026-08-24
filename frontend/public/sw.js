const CACHE = 'tb-admin-v2';
const OFFLINE_URL = '/admin';

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.add(OFFLINE_URL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    // Skip non-GET and API calls — always go to network
    if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Cache successful static/page responses
                if (res.ok && (url.origin === self.location.origin)) {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(e.request).then(r => r || caches.match(OFFLINE_URL)))
    );
});
