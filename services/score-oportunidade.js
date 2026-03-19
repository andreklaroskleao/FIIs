import { calcularDistanciaCircularEntreDias } from '../services/calculos-carteira.js';

export function obterStatusAtivo(ativo, pesoReal, pesoIdeal) {
    const estaAbaixoDoTeto = ativo.precoAtual <= ativo.precoTeto && ativo.precoAtual > 0;
    const pesoMuitoAbaixoDoIdeal = pesoIdeal > 0 && pesoReal < (pesoIdeal * 0.65);
    const diaAtual = new Date().getDate();
    const dataComProxima = ativo.diaDataCom ? calcularDistanciaCircularEntreDias(ativo.diaDataCom, diaAtual) <= 3 : false;

    if (ativo.precoAtual > ativo.precoTeto && ativo.precoTeto > 0) {
        return { rotulo: 'Acima do teto', classe: 'acima-teto' };
    }

    if (estaAbaixoDoTeto && pesoMuitoAbaixoDoIdeal && ativo.nota >= 7) {
        return { rotulo: 'Oportunidade', classe: 'oportunidade' };
    }

    if (dataComProxima) {
        return { rotulo: 'Data próxima', classe: 'data-proxima' };
    }

    if (pesoMuitoAbaixoDoIdeal) {
        return { rotulo: 'Peso baixo', classe: 'peso-baixo' };
    }

    return { rotulo: 'Neutro', classe: 'neutro' };
}

export function calcularScoreAtivo(ativo, pesoReal, pesoIdeal) {
    let score = 0;

    score += Math.min(ativo.nota, 10) * 0.4;

    if (ativo.precoAtual > 0 && ativo.precoTeto > 0) {
        if (ativo.precoAtual <= ativo.precoTeto) {
            score += Math.min(2.5, Math.max(0, ativo.diferencaParaPrecoTetoPercentual / 5));
        } else {
            score -= 1.5;
        }
    }

    if (pesoIdeal > 0 && pesoReal < pesoIdeal) {
        score += Math.min(2.0, ((pesoIdeal - pesoReal) / pesoIdeal) * 2);
    }

    if (ativo.rendaMensalEstimada > 0) {
        score += Math.min(1.5, ativo.rendaMensalEstimada / 5);
    }

    const diaAtual = new Date().getDate();
    const dataComProxima = ativo.diaDataCom ? calcularDistanciaCircularEntreDias(ativo.diaDataCom, diaAtual) <= 3 : false;
    if (dataComProxima) {
        score += 0.6;
    }

    return Math.max(0, Math.min(10, score));
}

export function gerarRankingDeOportunidades(listaAtivos, patrimonioTotal, somaDasNotas, caixaDisponivel) {
    return listaAtivos
        .map((ativo) => {
            const pesoIdeal = somaDasNotas > 0 ? ativo.nota / somaDasNotas : 0;
            const pesoReal = patrimonioTotal > 0 ? ativo.valorTotalAtual / patrimonioTotal : 0;
            const score = calcularScoreAtivo(ativo, pesoReal, pesoIdeal);

            let quantidadeSugerida = 0;
            if (pesoReal < pesoIdeal && ativo.precoAtual > 0 && ativo.precoAtual <= (ativo.precoTeto || Number.POSITIVE_INFINITY)) {
                quantidadeSugerida = Math.floor((((patrimonioTotal + caixaDisponivel) * pesoIdeal) - ativo.valorTotalAtual) / ativo.precoAtual);
            }

            return {
                ...ativo,
                score,
                pesoReal,
                pesoIdeal,
                quantidadeSugerida
            };
        })
        .sort((ativoA, ativoB) => ativoB.score - ativoA.score);
}
