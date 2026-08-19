// ============================================================
// sw.js
// Service worker básico: cacheia o "shell" do app (HTML/CSS/JS
// estático) para abrir instantaneamente mesmo com rede instável.
// Os dados (Firestore) NÃO passam por este cache — eles têm
// persistência offline própria, cuidada pelo próprio SDK do Firebase.
// ============================================================

const CACHE_NOME = "vitale-conciliacao-shell-v2";

const ARQUIVOS_DO_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/layout.css",
  "./css/formularios.css",
  "./css/dashboard.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/firebase-config.js",
  "./js/firestore.js",
  "./js/conciliacao.js",
  "./js/form-lancamento.js",
  "./js/dashboard.js",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(ARQUIVOS_DO_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NOME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  // Nunca intercepta chamadas ao Firebase/Google — só o shell estático.
  if (evento.request.url.includes("firestore") || evento.request.url.includes("googleapis")) {
    return;
  }
  evento.respondWith(
    caches.match(evento.request).then((respostaCache) => respostaCache || fetch(evento.request))
  );
});
