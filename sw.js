/* AMAZ Diagnostic - service worker: works offline, always loads the newest index.html when online */
const CACHE='amaz-diagnostic-v10';
const FILES=['./','./index.html','./manifest.webmanifest','./app-icon-192.png','./app-icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
const isPage=(req,u)=>req.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('version.json')){e.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match(req,{ignoreSearch:true})));return}
  if(isPage(req,u)&&!u.search){
    /* the page: ask the server for a fresh copy (cache-busting query so a CDN cannot give an old copy); offline -> saved copy */
    const fresh=new URL('./index.html',self.registration.scope);fresh.searchParams.set('b',Date.now());
    e.respondWith(fetch(fresh.href,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone(),c2=r.clone();caches.open(CACHE).then(x=>{x.put('./index.html',c);x.put('./',c2)})}return r}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));return}
  e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{if(r.ok&&!u.search){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))))});
