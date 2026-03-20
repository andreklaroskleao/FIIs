import { normalizarTicker } from './formatadores.js';

const URL_BASE_BRAPI = 'https://brapi.dev/api/quote';
const CHAVE_LOCAL_STORAGE_CACHE_COTACOES = 'fii_insight_cache_cotacoes';
const TEMPO_CACHE_MILISSEGUNDOS = 1000 * 60 * 30;

function montarMapaCotacoesVazio(listaTickers) {
    const mapaCotacoes = {};

    listaTickers.forEach((ticker) => {
        const tickerNormalizado = normalizarTicker(ticker);

        if (!tickerNormalizado) {
            return;
        }

        mapaCotacoes[tickerNormalizado] = {
            symbol: tickerNormalizado,
            regularMarketPrice: 0,
            fonteCotacao: 'vazio'
        };
    });

    return mapaCotacoes;
}

function lerCacheCotacoesDoLocalStorage() {
    try {
        const valorSalvo = localStorage.getItem(CHAVE_LOCAL_STORAGE_CACHE_COTACOES);

        if (!valorSalvo) {
            return {};
        }

        const cacheConvertido = JSON.parse(valorSalvo);

        if (typeof cacheConvertido !== 'object' || cacheConvertido === null) {
            return {};
        }

        return cacheConvertido;
    } catch {
        return {};
    }
}

function salvarCacheCotacoesNoLocalStorage(mapaCotacoes) {
    try {
        localStorage.setItem(CHAVE_LOCAL_STORAGE_CACHE_COTACOES, JSON.stringify(mapaCotacoes));
    } catch {
        return;
    }
}

function obterCotacoesDoCache(listaTickersNormalizados) {
    const cacheCotacoes = lerCacheCotacoesDoLocalStorage();
    const agora = Date.now();
    const mapaCotacoes = {};

    listaTickersNormalizados.forEach((ticker) => {
        const itemCache = cacheCotacoes[ticker];

        if (!itemCache) {
            return;
        }

        const atualizadoEm = Number(itemCache.atualizadoEm || 0);

        if (agora - atualizadoEm > TEMPO_CACHE_MILISSEGUNDOS) {
            return;
        }

        mapaCotacoes[ticker] = {
            symbol: ticker,
            regularMarketPrice: Number(itemCache.regularMarketPrice || 0),
            fonteCotacao: 'cache'
        };
    });

    return mapaCotacoes;
}

function atualizarCacheComCotacoes(mapaCotacoes) {
    const cacheAtual = lerCacheCotacoesDoLocalStorage();
    const agora = Date.now();

    Object.entries(mapaCotacoes).forEach(([ticker, cotacao]) => {
        const preco = Number(cotacao?.regularMarketPrice || 0);

        if (!Number.isFinite(preco) || preco <= 0) {
            return;
        }

        cacheAtual[ticker] = {
            regularMarketPrice: preco,
            atualizadoEm: agora
        };
    });

    salvarCacheCotacoesNoLocalStorage(cacheAtual);
}

function atualizarIndicadorStatusCotacoes(texto) {
    const indicador = document.getElementById('indicador-status-cotacoes');

    if (!indicador) {
        return;
    }

    indicador.textContent = texto;
}

export async function buscarCotacoesNaBrapi(listaTickers = []) {
    const listaTickersNormalizados = Array.from(
        new Set(
            (listaTickers || [])
                .map((ticker) => normalizarTicker(ticker))
                .filter(Boolean)
        )
    );

    if (listaTickersNormalizados.length === 0) {
        atualizarIndicadorStatusCotacoes('Cotações: sem ativos');
        return {};
    }

    const mapaCotacoesPadrao = montarMapaCotacoesVazio(listaTickersNormalizados);
    const mapaCotacoesDoCache = obterCotacoesDoCache(listaTickersNormalizados);

    try {
        atualizarIndicadorStatusCotacoes('Cotações: carregando BRAPI');

        const parametroTickers = encodeURIComponent(listaTickersNormalizados.join(','));
        const url = `${URL_BASE_BRAPI}/${parametroTickers}`;

        const resposta = await fetch(url, {
            method: 'GET'
        });

        if (!resposta.ok) {
            if (Object.keys(mapaCotacoesDoCache).length > 0) {
                atualizarIndicadorStatusCotacoes('Cotações: usando cache local');
                return {
                    ...mapaCotacoesPadrao,
                    ...mapaCotacoesDoCache
                };
            }

            atualizarIndicadorStatusCotacoes('Cotações: BRAPI indisponível');
            return mapaCotacoesPadrao;
        }

        const dadosResposta = await resposta.json();
        const listaResultados = Array.isArray(dadosResposta?.results) ? dadosResposta.results : [];

        const mapaCotacoes = { ...mapaCotacoesPadrao };

        listaResultados.forEach((itemResultado) => {
            const tickerNormalizado = normalizarTicker(itemResultado?.symbol);
            const precoMercado = Number(itemResultado?.regularMarketPrice);

            if (!tickerNormalizado) {
                return;
            }

            mapaCotacoes[tickerNormalizado] = {
                ...itemResultado,
                symbol: tickerNormalizado,
                regularMarketPrice: Number.isFinite(precoMercado) ? precoMercado : 0,
                fonteCotacao: Number.isFinite(precoMercado) ? 'brapi' : 'vazio'
            };
        });

        const existeAoMenosUmaCotacaoValida = Object.values(mapaCotacoes).some((item) => {
            return Number(item?.regularMarketPrice || 0) > 0;
        });

        if (existeAoMenosUmaCotacaoValida) {
            atualizarCacheComCotacoes(mapaCotacoes);
            atualizarIndicadorStatusCotacoes('Cotações: BRAPI carregada');
            return mapaCotacoes;
        }

        if (Object.keys(mapaCotacoesDoCache).length > 0) {
            atualizarIndicadorStatusCotacoes('Cotações: BRAPI vazia, usando cache');
            return {
                ...mapaCotacoesPadrao,
                ...mapaCotacoesDoCache
            };
        }

        atualizarIndicadorStatusCotacoes('Cotações: sem retorno válido');
        return mapaCotacoesPadrao;
    } catch {
        if (Object.keys(mapaCotacoesDoCache).length > 0) {
            atualizarIndicadorStatusCotacoes('Cotações: erro na BRAPI, usando cache');
            return {
                ...mapaCotacoesPadrao,
                ...mapaCotacoesDoCache
            };
        }

        atualizarIndicadorStatusCotacoes('Cotações: erro na BRAPI');
        return mapaCotacoesPadrao;
    }
}