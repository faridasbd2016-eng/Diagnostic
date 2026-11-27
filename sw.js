/* AMAZ Diagnostic — service worker
   Opens offline after it has been opened once with internet; loads the newest index.html when online. */
const PREFIX='amaz-diagnostic-v';
const CACHE=PREFIX+'12';
const LIBS='amaz-diagnostic-libs-v1';            /* CDN libraries — kept across versions */
const SHELL=['./index.html','./manifest.webmanifest','./app-icon-192.png','./app-icon-512.png','./app-icon-maskable-192.png','./app-icon-maskable-512.png'];
const CDN=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

/* install: every file on its own — one missing file never stops the rest */
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);
  await Promise.all(SHELL.map(u=>fetch(u,{cache:'reload'}).then(r=>{if(r&&r.ok)return c.put(u,r.clone()).then(()=>{if(u==='./index.html')return c.put('./',r.clone())})}).catch(()=>{})));
  await self.skipWaiting()})())});

/* activate: remove older caches of THIS app only — and only when the new cache really has index.html */
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);const ok=await c.match('./index.html');
  if(ok){const ks=await caches.keys();await Promise.all(ks.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))}
  await self.clients.claim()})())});
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});

const OFFLINE_HTML=`<!DOCTYPE html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AMAZ Diagnostic</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,'Nirmala UI',sans-serif;background:#0f172a;color:#fff;text-align:center}div{padding:24px}h2{margin:.3em 0}p{color:#cbd5e1}button{margin-top:14px;padding:11px 26px;border:0;border-radius:10px;background:#0f766e;color:#fff;font-size:16px;cursor:pointer}</style></head>
<body><div><div style="font-size:46px">📡</div><h2>ইন্টারনেট নেই</h2><p>অ্যাপটি একবার ইন্টারনেট সহ খুলুন — তারপর ইন্টারনেট ছাড়াও খুলবে।</p><button onclick="location.reload()">আবার চেষ্টা</button></div></body></html>`;

const withTimeout=(url,opt,ms)=>{const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms);return fetch(url,{...opt,signal:ac.signal}).finally(()=>clearTimeout(t))};
async function fromAnyCache(){for(const k of ['./index.html','./','index.html']){const r=await caches.match(k,{ignoreSearch:true});if(r)return r}
  const scope=self.registration.scope;for(const k of [scope+'index.html',scope]){const r=await caches.match(k,{ignoreSearch:true});if(r)return r}return null}

async function page(){const fresh=new URL('./index.html',self.registration.scope);fresh.searchParams.set('b',Date.now());   /* cache-busting so GitHub's CDN cannot give an old copy */
  try{const r=await withTimeout(fresh.href,{cache:'no-store'},3500);
    if(r&&r.ok){const c=await caches.open(CACHE);await c.put('./index.html',r.clone());await c.put('./',r.clone());return r}}catch(e){}
  const hit=await fromAnyCache();if(hit)return hit;
  return new Response(OFFLINE_HTML,{status:200,headers:{'Content-Type':'text/html; charset=utf-8'}})}

self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);
  /* CDN libraries: cache-first in a cache that survives version changes (opaque responses too) */
  if(CDN.test(req.url)){e.respondWith((async()=>{const c=await caches.open(LIBS);const hit=await c.match(req);if(hit)return hit;
    try{const r=await fetch(req);if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r}catch(x){return new Response('',{status:504,statusText:'Offline'})}})());return}
  if(u.origin!==location.origin)return;
  const scopePath=new URL(self.registration.scope).pathname;
  const isPage=req.mode==='navigate'||u.pathname===scopePath||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  if(isPage){e.respondWith(page());return}
  if(u.pathname.endsWith('version.json')){e.respondWith(fetch(req,{cache:'no-store'}).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));return}
  /* other files of this app: cache-first, else network (and keep a copy) */
  e.respondWith((async()=>{const hit=await caches.match(req,{ignoreSearch:true});if(hit)return hit;
    try{const r=await fetch(req);if(r&&r.ok){const c=await caches.open(CACHE);c.put(req,r.clone())}return r}catch(x){return new Response('',{status:504,statusText:'Offline'})}})())});
