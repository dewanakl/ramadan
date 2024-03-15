const cacheName = 'app';

const contentToCache = [
    '/index.html',
    '/icon.png',
    '/manifest.webmanifest'
];

self.addEventListener('install', (e) => {
    const VERSION = 'v' + ((new URL(location)).searchParams.get('v') ?? '1');

    console.log(`[SW] Install ${VERSION}`);
    e.waitUntil(
        (async () => {
            const cache = await caches.open(cacheName + '-' + VERSION);
            console.log('[SW] Caching all: app shell and content');
            await cache.addAll(contentToCache);
        })(),
    );
});

self.addEventListener('fetch', (e) => {
    const VERSION = 'v' + ((new URL(location)).searchParams.get('v') ?? '1');

    e.respondWith(
        (async () => {
            const r = await caches.match(e.request);
            console.log(`[SW] Fetching resource: ${e.request.url}`);
            if (r) {
                return r;
            }

            const response = await fetch(e.request);
            const cache = await caches.open(cacheName + '-' + VERSION);

            console.log(`[SW] Caching new resource: ${e.request.url}`);
            cache.put(e.request, response.clone());
            return response;
        })(),
    );
});

self.addEventListener('activate', (e) => {
    const VERSION = 'v' + ((new URL(location)).searchParams.get('v') ?? '1');

    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key === (cacheName + '-' + VERSION)) {
                        return;
                    }

                    return caches.delete(key);
                }),
            );
        }),
    );
});
