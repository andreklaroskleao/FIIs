const NOME_CACHE_ESTATICO = 'fii-insight-cache-v1';
const ARQUIVOS_PARA_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './firebase-config.js',
    './manifest.webmanifest',
    './assets/logo-fii-insight.svg'
];

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(NOME_CACHE_ESTATICO).then((cache) => {
            return cache.addAll(ARQUIVOS_PARA_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((listaChaves) => {
            return Promise.all(
                listaChaves.map((chave) => {
                    if (chave !== NOME_CACHE_ESTATICO) {
                        return caches.delete(chave);
                    }

                    return Promise.resolve();
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('fetch', (evento) => {
    if (evento.request.method !== 'GET') {
        return;
    }

    evento.respondWith(
        caches.match(evento.request).then((respostaEmCache) => {
            if (respostaEmCache) {
                return respostaEmCache;
            }

            return fetch(evento.request)
                .then((respostaRede) => {
                    const copiaResposta = respostaRede.clone();

                    if (
                        evento.request.url.startsWith(self.location.origin) &&
                        respostaRede.status === 200
                    ) {
                        caches.open(NOME_CACHE_ESTATICO).then((cache) => {
                            cache.put(evento.request, copiaResposta);
                        });
                    }

                    return respostaRede;
                })
                .catch(() => {
                    return caches.match('./index.html');
                });
        })
    );
});