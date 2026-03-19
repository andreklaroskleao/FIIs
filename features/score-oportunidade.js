import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

export function calcularScoreAtivo(ativo, pesoReal, pesoIdeal, caixaDisponivel = 0) {
    let score = 0;

    if (ativo.precoAtual > 0 && ativo.precoTeto > 0 && ativo.precoAtual <= ativo.precoTeto) {
        score += 3;
    }

    if (ativo.nota > 0) {
        score += ativo.nota * 0.4;
    }

    if (pesoReal < pesoIdeal) {
        score += 2;
    }

    if (ativo.rendaMensalEstimada > 0) {
        score += 1;
    }

    if (caixaDisponivel > 0 && ativo.precoAtual > 0 && caixaDisponivel >= ativo.precoAtual) {
        score += 0.5;
    }

    return Number(score.toFixed(1));
}

export function obterStatusAtivo(ativo, pesoReal, pesoIdeal) {
    if (ativo.precoTeto > 0 && ativo.precoAtual > 0 && ativo.precoAtual > ativo.precoTeto) {
        return { rotulo: 'Acima do teto', classe: 'acima-teto' };
    }

    if (pesoReal < pesoIdeal && ativo.precoAtual > 0 && ativo.precoTeto > 0 && ativo.precoAtual <= ativo.precoTeto) {
        return { rotulo: 'Oportunidade', classe: 'oportunidade' };
    }

    if (pesoReal < pesoIdeal) {
        return { rotulo: 'Peso baixo', classe: 'peso-baixo' };
    }

    return { rotulo: 'Neutro', classe: 'neutro' };
}

export function gerarRankingDeOportunidades(listaAtivos, patrimonioTotal, somaDasNotas, caixaDisponivel) {
    return listaAtivos
        .map((ativo) => {
            const pesoReal = patrimonioTotal > 0 ? ativo.valorTotalAtual / patrimonioTotal : 0;
            const pesoIdeal = somaDasNotas > 0 ? ativo.nota / somaDasNotas : 0;
            const score = calcularScoreAtivo(ativo, pesoReal, pesoIdeal, caixaDisponivel);

            return {
                ...ativo,
                score: converterParaNumeroSeguro(score, 0)
            };
        })
        .sort((ativoA, ativoB) => ativoB.score - ativoA.score);
}