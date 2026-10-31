const V='veil-v1';
const ASSETS=['./','index.html','styles.css','config.js','i18n.js','app.js','vendor/supabase.js','fonts/fraktur.woff2','fonts/pinyon.woff2','fonts/corm.woff2','fonts/corm-i.woff2','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/badge.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch{d={title:'秘幕手帐',body:'你有一条日程提醒'}}
  e.waitUntil(self.registration.showNotification(d.title||'秘幕手帐',{body:d.body||'',tag:d.tag,icon:'icons/icon-192.png',badge:'icons/badge.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus'in c)return c.focus()}return clients.openWindow(e.notification.data?.url||'./')}))});
