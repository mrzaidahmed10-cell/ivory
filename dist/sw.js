const C='ivory-v5',F=['/','/index.html','/manifest.json','/icon.svg','/icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!='GET'||u.origin!=location.origin||u.pathname.startsWith('/api/'))return;
e.respondWith(caches.match(r,{ignoreSearch:true}).then(c=>{const f=fetch(r).then(x=>{if(x.ok){const k=x.clone();caches.open(C).then(y=>y.put(r,k))}return x}).catch(()=>c||caches.match('/'));return c||f}))});
