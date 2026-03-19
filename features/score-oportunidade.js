import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

export function obterStatusAtivo(ativo, patrimonioTotal = 0, somaDasNotas = 0) {
    const precoAtual = converterParaNumeroSeguro(ativo?.precoAtual, 0);
    const precoTeto = converterParaNumeroSeguro(ativo?.precoTeto, 0);
    const nota = converterParaNumeroSeguro(ativo?.nota, 0);
    const valorTotalAtual = converterParaNumeroSeguro(ativo?.valorTotalAtual, 0);
    const patrimonioTotalSeguro = converterParaNumeroSeguro(patrimonioTotal, 0);
    const somaDasNotasSegura = converterParaNumeroSeguro(somaDasNotas, 0);

    const percentualAlocacaoAtual = patrimonioTotalSeguro > 0
        ? (valorTotalAtual / patrimonioTotalSeguro) * 100
        : 0;

    const percentualAlocacaoAlvo = somaDasNotasSegura > 0
        ? (nota / somaDasNotasSegura) * 100
        : 0;

    const abaixoDoPrecoTeto = precoAtual > 0 && precoTeto > 0 && precoAtual <= precoTeto;
    const acimaDoPrecoTeto = precoAtual > 0 && precoTeto > 0 && precoAtual > precoTeto;
    const abaixoDoPesoAlvo = percentualAlocacaoAtual < percentualAlocacaoAlvo;

    let tipoStatus = 'neutro';
    let textoStatus = 'Neutro';

    if (acimaDoPrecoTeto) {
        tipoStatus = 'acima-teto';
        textoStatus = 'Acima do teto';
    } else if (abaixoDoPrecoTeto && abaixoDoPesoAlvo) {
        tipoStatus = 'oportunidade';
        textoStatus = 'Oportunidade';
    } else if (abaixoDoPesoAlvo) {
        tipoStatus = 'peso-baixo';
        textoStatus = 'Abaixo do peso';
    }

    return {
        tipoStatus,
        textoStatus,
        percentualAlocacaoAtual,
        percentualAlocacaoAlvo,
        abaixoDoPrecoTeto,
        acimaDoPrecoTeto,
        abaixoDoPesoAlvo
    };
}

export function gerarRankingDeOportunidades(listaAtivos, patrimonioTotal = 0, somaDasNotas = 0, caixaDisponivel = 0) {
    const patrimonioTotalSeguro = converterParaNumeroSeguro(patrimonioTotal, 0);
    const somaDasNotasSegura = converterParaNumeroSeguro(somaDasNotas, 0);
    const caixaDisponivelSeguro = converterParaNumeroSeguro(caixaDisponivel, 0);

    const listaRanking = (listaAtivos || []).map((ativo) => {
        const precoAtual = converterParaNumeroSeguro(ativo.precoAtual, 0);
        const precoTeto = converterParaNumeroSeguro(ativo.precoTeto, 0);
        const nota = converterParaNumeroSeguro(ativo.nota, 0);
        const valorTotalAtual = converterParaNumeroSeguro(ativo.valorTotalAtual, 0);

        const percentualAlocacaoAtual = patrimonioTotalSeguro > 0
            ? (valorTotalAtual / patrimonioTotalSeguro) * 100
            : 0;

        const percentualAlocacaoAlvo = somaDasNotasSegura > 0
            ? (nota / somaDasNotasSegura) * 100
            : 0;

        const descontoPercentual = precoTeto > 0 && precoAtual > 0
            ? ((precoTeto - precoAtual) / precoTeto) * 100
            : 0;

        const defasagemAlocacao = Math.max(0, percentualAlocacaoAlvo - percentualAlocacaoAtual);
        const quantidadeMaximaComCaixa = precoAtual > 0
            ? Math.floor(caixaDisponivelSeguro / precoAtual)
            : 0;

        let score = 0;
        score += nota * 10;
        score += descontoPercentual > 0 ? descontoPercentual * 2 : 0;
        score += defasagemAlocacao * 4;
        score += ativo.favorito ? 5 : 0;
        score -= ativo.emWatchlist ? 8 : 0;
        score -= precoAtual > precoTeto && precoTeto > 0 ? 20 : 0;

        return {
            id: ativo.id,
            ticker: ativo.ticker,
            score: Number(score.toFixed(2)),
            nota,
            precoAtual,
            precoTeto,
            percentualAlocacaoAtual,
            percentualAlocacaoAlvo,
            descontoPercentual,
            defasagemAlocacao,
            quantidadeMaximaComCaixa,
            rendaMensalEstimada: converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0),
            valorTotalAtual,
            favorito: Boolean(ativo.favorito),
            emWatchlist: Boolean(ativo.emWatchlist)
        };
    });

    return listaRanking
        .sort((itemA, itemB) => itemB.score - itemA.score)
        .map((item, indice) => ({
            ...item,
            posicaoRanking: indice + 1
        }));
}