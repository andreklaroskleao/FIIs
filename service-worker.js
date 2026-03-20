const VERSAO_CACHE_ESTATICO = 'fii-insight-estatico-v2';
const VERSAO_CACHE_DINAMICO = 'fii-insight-dinamico-v2';

const ARQUIVOS_ESTATICOS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './firebase-config.js',
    './manifest.webmanifest',
    './assets/logo-fii-insight.svg',
    './assets/logo-fii-insight-192.png',
    './assets/logo-fii-insight-512.png'
];

self.addEventListener('install', (evento) => {
    evento.waitUntil(
        caches.open(VERSAO_CACHE_ESTATICO).then((cache) => {
            return cache.addAll(ARQUIVOS_ESTATICOS);
        })
    );

    self.skipWaiting();
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys().then((listaChaves) => {
            return Promise.all(
                listaChaves.map((chave) => {
                    const cacheValido = chave === VERSAO_CACHE_ESTATICO || chave === VERSAO_CACHE_DINAMICO;

                    if (!cacheValido) {
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

    const urlRequisicao = new URL(evento.request.url);
    const requisicaoMesmoDominio = urlRequisicao.origin === self.location.origin;

    if (requisicaoMesmoDominio) {
        evento.respondWith(
            caches.match(evento.request).then((respostaEmCache) => {
                if (respostaEmCache) {
                    return respostaEmCache;
                }

                return fetch(evento.request)
                    .then((respostaRede) => {
                        if (!respostaRede || respostaRede.status !== 200) {
                            return respostaRede;
                        }

                        const copiaResposta = respostaRede.clone();

                        caches.open(VERSAO_CACHE_DINAMICO).then((cache) => {
                            cache.put(evento.request, copiaResposta);
                        });

                        return respostaRede;
                    })
                    .catch(() => {
                        return caches.match('./index.html');
                    });
            })
        );

        return;
    }

    evento.respondWith(
        fetch(evento.request).catch(() => {
            return new Response('Sem conexão no momento.', {
                status: 503,
                statusText: 'Offline'
            });
        })
    );
});