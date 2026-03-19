import { normalizarTicker } from './formatadores.js';

function criarMapaCotacoesVazio(listaTickers) {
    const mapaCotacoes = {};

    listaTickers.forEach((ticker) => {
        const tickerNormalizado = normalizarTicker(ticker);
        if (tickerNormalizado) {
            mapaCotacoes[tickerNormalizado] = {
                regularMarketPrice: 0,
                dividendYield: 0
            };
        }
    });

    return mapaCotacoes;
}

export async function buscarCotacoesNaBrapi(listaTickers) {
    const listaNormalizada = Array.from(
        new Set(
            (listaTickers || [])
                .map((ticker) => normalizarTicker(ticker))
                .filter(Boolean)
        )
    );

    if (!listaNormalizada.length) {
        return {};
    }

    const mapaCotacoesPadrao = criarMapaCotacoesVazio(listaNormalizada);

    try {
        const simbolos = listaNormalizada.join(',');
        const url = `https://brapi.dev/api/quote/${simbolos}?range=1d&interval=1d&fundamental=true`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            return mapaCotacoesPadrao;
        }

        const dados = await resposta.json();
        const resultados = Array.isArray(dados?.results) ? dados.results : [];

        resultados.forEach((itemResultado) => {
            const tickerNormalizado = normalizarTicker(itemResultado.symbol);

            mapaCotacoesPadrao[tickerNormalizado] = {
                regularMarketPrice: Number(itemResultado.regularMarketPrice) || 0,
                dividendYield: Number(itemResultado.dividendYield) || 0
            };
        });

        return mapaCotacoesPadrao;
    } catch {
        return mapaCotacoesPadrao;
    }
}