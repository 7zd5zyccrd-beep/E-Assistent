/* BDS E-Assistent – Speicher auf dem Gerät (v1.274, Jean: nach dem Schließen lud die App
   manchmal lange mit leerem Bildschirm; neue Versionen sollen still kommen).

   Die App-Dateien (index.html, sam.html, sam-geraete.html), die Google-Schriften und das
   Firebase-Programm kommen sofort aus dem Speicher; im Hintergrund wird die Fassung aus dem
   Netz geholt und für den nächsten Start abgelegt. Eine neue Version erscheint also beim
   übernächsten Öffnen. „App neu laden“ (Einstellungen › Konto) leert den Speicher und holt
   alles frisch. Projekte, Fotos und Einstellungen liegen nicht hier, sondern wie bisher im
   Speicher der App. Alles andere (Firebase-Daten, Adressvorschläge, SAM-Modelle) geht
   unverändert ans Netz. */
const SPEICHER = 'bds-app-1';
const FREMD = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for(const k of await caches.keys()) if(k.startsWith('bds-app') && k !== SPEICHER) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  const r = e.request;
  if(r.method !== 'GET') return;
  const u = new URL(r.url);
  const eigen = u.origin === self.location.origin;
  const firebase = u.hostname === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/');
  if(eigen){
    if(!(r.mode === 'navigate' || /\.html$/.test(u.pathname) || u.pathname.endsWith('/'))) return;
  } else if(!FREMD.includes(u.hostname) && !firebase) return;
  /* eigene Seiten ohne Anhang (?v=…, ?einbettung) ablegen – es ist dieselbe Datei */
  const schluessel = eigen ? u.origin + u.pathname : r.url;
  e.respondWith((async () => {
    const sp = await caches.open(SPEICHER);
    const alt = await sp.match(schluessel);
    const neu = (eigen ? fetch(schluessel, {cache: 'no-store'}) : fetch(r))
      .then(a => { if(a && (a.ok || a.type === 'opaque')) sp.put(schluessel, a.clone()); return a; })
      .catch(() => null);
    /* versionierte Firebase-Dateien ändern sich nie – dort genügt der Speicher */
    if(alt){ if(!firebase) e.waitUntil(neu); return alt; }
    return (await neu) || Response.error();
  })());
});
