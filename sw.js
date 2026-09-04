const CACHE_NAME = 'lanelab-shell-v8';
const SHELL = ['./', './index.html', './js/stats.js', './js/profile.js', './js/arsenal.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('lanelab-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const isNavigation=event.request.mode==='navigate';
  const isWorker=new URL(event.request.url).pathname.endsWith('/sw.js');
  // Always check the network for the app shell and worker so a published
  // release can replace stale code instead of trapping users on an old build.
  if(isNavigation || isWorker){
    event.respondWith(fetch(event.request).then(response=>{
      if(isNavigation){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));}
      return response;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});
