const CACHE = 'tb-v3';
const OFFLINE_HOME = '/';
const OFFLINE_ADMIN = '/admin';

// Bounded page cache: the site has 70+ crawlable URLs, so an unbounded
// cache would grow until the browser evicts it under storage pressure.
const MAX_PAGES = 40;

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll([OFFLINE_HOME, OFFLINE_ADMIN]))
            .then(() => self.skipWaiting())
            .catch(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

async function trimCache(cache) {
    const keys = await cache.keys();
    const pages = keys.filter(r => {
        const p = new URL(r.url).pathname;
        return !p.startsWith('/assets/') && !/\.[a-z0-9]{2,4}$/i.test(p);
    });
    if (pages.length <= MAX_PAGES) return;
    for (const r of pages.slice(0, pages.length - MAX_PAGES)) {
        if (r.url.endsWith(OFFLINE_HOME) || r.url.endsWith(OFFLINE_ADMIN)) continue;
        await cache.delete(r);
    }
}

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);

    if (e.request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/')) return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res.ok && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then(async c => {
                        await c.put(e.request, copy);
                        await trimCache(c);
                    }).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(e.request).then(hit => {
                if (hit) return hit;
                // Fall back to the shell that matches where the user actually is,
                // so a public visitor offline never lands on the admin panel.
                const shell = url.pathname.startsWith('/admin') ? OFFLINE_ADMIN : OFFLINE_HOME;
                return caches.match(shell);
            }))
    );
});
