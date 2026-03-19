import { normalizarTicker } from './formatadores.js';

const CHAVE_API_BRAPI = 'hshuPrGV3kvLM6Yh8FEDrD';
const TAMANHO_LOTE_BRAPI = 20;

export async function buscarCotacoesNaBrapi(listaTickers) {
    if (!Array.isArray(listaTickers) || listaTickers.length === 0) {
        return {};
    }

    const listaUnicaTickers = [];
    const mapaTickersJaProcessados = {};

    listaTickers.forEach((ticker) => {
        const tickerNormalizado = normalizarTicker(ticker);
        if (tickerNormalizado && !mapaTickersJaProcessados[tickerNormalizado]) {
            mapaTickersJaProcessados[tickerNormalizado] = true;
            listaUnicaTickers.push(tickerNormalizado);
        }
    });

    const mapaCotacoes = {};

    for (let indice = 0; indice < listaUnicaTickers.length; indice += TAMANHO_LOTE_BRAPI) {
        const loteAtual = listaUnicaTickers.slice(indice, indice + TAMANHO_LOTE_BRAPI);
        const tickersConcatenados = encodeURIComponent(loteAtual.join(','));

        try {
            const resposta = await fetch(`https://brapi.dev/api/quote/${tickersConcatenados}?token=${CHAVE_API_BRAPI}`);

            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status}`);
            }

            const dadosResposta = await resposta.json();

            if (Array.isArray(dadosResposta.results)) {
                dadosResposta.results.forEach((ativo) => {
                    if (ativo && ativo.symbol) {
                        mapaCotacoes[ativo.symbol] = ativo;
                    }
                });
            }
        } catch (erro) {
            console.error('Erro ao buscar cotações na BRAPI:', erro);
        }
    }

    return mapaCotacoes;
}
