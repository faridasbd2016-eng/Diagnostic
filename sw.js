/* AMAZ Diagnostic - service worker: works offline, always takes the newest index.html when online */
const CACHE='amaz-diagnostic-v5';
const FILES=['./','./index.html','./manifest.webmanifest','./app-icon-192.png','./app-icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('version.json')){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return}
  e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
