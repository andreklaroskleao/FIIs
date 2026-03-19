import { normalizarTicker } from './formatadores.js';

const URL_BASE_BRAPI = 'https://brapi.dev/api/quote';

function montarMapaCotacoesVazio(listaTickers) {
    const mapaCotacoes = {};

    listaTickers.forEach((ticker) => {
        const tickerNormalizado = normalizarTicker(ticker);

        if (!tickerNormalizado) {
            return;
        }

        mapaCotacoes[tickerNormalizado] = {
            symbol: tickerNormalizado,
            regularMarketPrice: 0
        };
    });

    return mapaCotacoes;
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
        return {};
    }

    const mapaCotacoesPadrao = montarMapaCotacoesVazio(listaTickersNormalizados);

    try {
        const parametroTickers = encodeURIComponent(listaTickersNormalizados.join(','));
        const url = `${URL_BASE_BRAPI}/${parametroTickers}`;

        const resposta = await fetch(url, {
            method: 'GET'
        });

        if (!resposta.ok) {
            return mapaCotacoesPadrao;
        }

        const dadosResposta = await resposta.json();
        const listaResultados = Array.isArray(dadosResposta?.results) ? dadosResposta.results : [];

        const mapaCotacoes = { ...mapaCotacoesPadrao };

        listaResultados.forEach((itemResultado) => {
            const tickerNormalizado = normalizarTicker(itemResultado?.symbol);

            if (!tickerNormalizado) {
                return;
            }

            mapaCotacoes[tickerNormalizado] = {
                ...itemResultado,
                symbol: tickerNormalizado,
                regularMarketPrice: Number.isFinite(Number(itemResultado?.regularMarketPrice))
                    ? Number(itemResultado.regularMarketPrice)
                    : 0
            };
        });

        return mapaCotacoes;
    } catch {
        return mapaCotacoesPadrao;
    }
}