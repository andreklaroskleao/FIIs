import { LISTA_SEGMENTOS_VALIDOS, validarDiaDoMes } from './validacoes.js';
import { normalizarTicker } from './formatadores.js';

export function converterParaNumeroSeguro(valor, valorPadrao = 0) {
    const numeroConvertido = Number(valor);
    return Number.isFinite(numeroConvertido) ? numeroConvertido : valorPadrao;
}

export function calcularDistanciaCircularEntreDias(diaA, diaB) {
    const diferencaAbsoluta = Math.abs(diaA - diaB);
    return Math.min(diferencaAbsoluta, 31 - diferencaAbsoluta);
}

export function calcularLucroPrejuizo(valorTotalAtual, valorTotalInvestido) {
    const valor = valorTotalAtual - valorTotalInvestido;
    const percentual = valorTotalInvestido > 0 ? (valor / valorTotalInvestido) * 100 : 0;

    return { valor, percentual };
}

export function calcularRendaEstimada(precoAtual, dividendYieldAnual, quantidade) {
    const dividendoMensalEstimadoPorCota = dividendYieldAnual > 0
        ? (precoAtual * (dividendYieldAnual / 100)) / 12
        : precoAtual * 0.008;

    const rendaMensal = quantidade * dividendoMensalEstimadoPorCota;
    const rendaAnual = rendaMensal * 12;

    return {
        dividendoMensalEstimadoPorCota,
        rendaMensal,
        rendaAnual
    };
}

export function calcularDiferencaParaPrecoTeto(precoAtual, precoTeto) {
    const valor = precoTeto - precoAtual;
    const percentual = precoAtual > 0 ? ((precoTeto - precoAtual) / precoAtual) * 100 : 0;

    return {
        valor,
        percentual
    };
}

export function agruparAportesPorTicker(listaAportes) {
    const mapaAportesPorTicker = {};

    listaAportes.forEach((aporte) => {
        const tickerNormalizado = normalizarTicker(aporte.ticker);

        if (!tickerNormalizado) {
            return;
        }

        if (!mapaAportesPorTicker[tickerNormalizado]) {
            mapaAportesPorTicker[tickerNormalizado] = [];
        }

        mapaAportesPorTicker[tickerNormalizado].push({
            ...aporte,
            ticker: tickerNormalizado,
            quantidadeComprada: converterParaNumeroSeguro(aporte.quantidadeComprada, 0),
            precoPorCota: converterParaNumeroSeguro(aporte.precoPorCota, 0),
            valorTotalAporte: converterParaNumeroSeguro(aporte.valorTotalAporte, 0),
            dataAporte: aporte.dataAporte || ''
        });
    });

    Object.keys(mapaAportesPorTicker).forEach((ticker) => {
        mapaAportesPorTicker[ticker].sort((aporteA, aporteB) => {
            const dataA = aporteA.dataAporte || '';
            const dataB = aporteB.dataAporte || '';
            return dataA.localeCompare(dataB);
        });
    });

    return mapaAportesPorTicker;
}

export function calcularResumoAportesDoTicker(listaAportesDoTicker) {
    let quantidadeCalculada = 0;
    let valorInvestidoCalculado = 0;

    listaAportesDoTicker.forEach((aporte) => {
        quantidadeCalculada += converterParaNumeroSeguro(aporte.quantidadeComprada, 0);
        valorInvestidoCalculado += converterParaNumeroSeguro(aporte.valorTotalAporte, 0);
    });

    const precoMedioCalculado = quantidadeCalculada > 0
        ? valorInvestidoCalculado / quantidadeCalculada
        : 0;

    return {
        quantidadeCalculada,
        valorInvestidoCalculado,
        precoMedioCalculado,
        quantidadeDeAportes: listaAportesDoTicker.length
    };
}

export function enriquecerListaAtivos(listaAtivosOriginal, mapaCotacoes, listaAportes = []) {
    const mapaAportesPorTicker = agruparAportesPorTicker(listaAportes);

    return listaAtivosOriginal.map((ativoOriginal) => {
        const tickerNormalizado = normalizarTicker(ativoOriginal.ticker);
        const dadosMercado = mapaCotacoes[tickerNormalizado] || {};
        const listaAportesDoTicker = mapaAportesPorTicker[tickerNormalizado] || [];

        const quantidadeCadastro = converterParaNumeroSeguro(ativoOriginal.quantidade, 0);
        const precoMedioCadastro = converterParaNumeroSeguro(ativoOriginal.precoMedio, 0);

        const resumoAportes = calcularResumoAportesDoTicker(listaAportesDoTicker);

        const usarResumoAportes = resumoAportes.quantidadeCalculada > 0;

        const quantidade = usarResumoAportes
            ? resumoAportes.quantidadeCalculada
            : quantidadeCadastro;

        const precoMedio = usarResumoAportes
            ? resumoAportes.precoMedioCalculado
            : precoMedioCadastro;

        const valorTotalInvestido = usarResumoAportes
            ? resumoAportes.valorInvestidoCalculado
            : precoMedioCadastro * quantidadeCadastro;

        const precoAtual = converterParaNumeroSeguro(dadosMercado.regularMarketPrice, 0);
        const dividendYieldAnual = converterParaNumeroSeguro(dadosMercado.dividendYield, 0);
        const valorTotalAtual = precoAtual * quantidade;
        const lucroPrejuizo = calcularLucroPrejuizo(valorTotalAtual, valorTotalInvestido);
        const rendaEstimada = calcularRendaEstimada(precoAtual, dividendYieldAnual, quantidade);
        const diferencaPrecoTeto = calcularDiferencaParaPrecoTeto(
            precoAtual,
            converterParaNumeroSeguro(ativoOriginal.precoTeto, 0)
        );

        return {
            id: ativoOriginal.id,
            uid: ativoOriginal.uid,
            ticker: tickerNormalizado,
            quantidade,
            precoMedio,
            quantidadeCadastro,
            precoMedioCadastro,
            quantidadeCalculadaPorAportes: resumoAportes.quantidadeCalculada,
            precoMedioCalculadoPorAportes: resumoAportes.precoMedioCalculado,
            quantidadeDeAportes: resumoAportes.quantidadeDeAportes,
            origemCalculoPosicao: usarResumoAportes ? 'aportes' : 'cadastro',
            nota: converterParaNumeroSeguro(ativoOriginal.nota, 0),
            precoTeto: converterParaNumeroSeguro(ativoOriginal.precoTeto, 0),
            diaDataCom: validarDiaDoMes(ativoOriginal.diaDataCom),
            diaPagamento: validarDiaDoMes(ativoOriginal.diaPagamento),
            segmento: LISTA_SEGMENTOS_VALIDOS.includes(ativoOriginal.segmento) ? ativoOriginal.segmento : 'Outros',
            observacao: ativoOriginal.observacao || '',
            favorito: Boolean(ativoOriginal.favorito),
            emWatchlist: Boolean(ativoOriginal.emWatchlist),
            precoAtual,
            dividendoMensalEstimadoPorCota: rendaEstimada.dividendoMensalEstimadoPorCota,
            rendaMensalEstimada: rendaEstimada.rendaMensal,
            rendaAnualEstimada: rendaEstimada.rendaAnual,
            valorTotalAtual,
            valorTotalInvestido,
            lucroPrejuizoValor: lucroPrejuizo.valor,
            lucroPrejuizoPercentual: lucroPrejuizo.percentual,
            diferencaParaPrecoTetoValor: diferencaPrecoTeto.valor,
            diferencaParaPrecoTetoPercentual: diferencaPrecoTeto.percentual
        };
    });
}

export function obterListaAtivosFiltradaEOrdenada(listaAtivos, filtroSegmentoAtual, ordenacaoCarteiraAtual) {
    let listaProcessada = filtroSegmentoAtual === 'Todos'
        ? [...listaAtivos]
        : listaAtivos.filter((ativo) => ativo.segmento === filtroSegmentoAtual);

    switch (ordenacaoCarteiraAtual) {
        case 'menor-posicao':
            listaProcessada.sort((ativoA, ativoB) => ativoA.valorTotalAtual - ativoB.valorTotalAtual);
            break;
        case 'ticker':
            listaProcessada.sort((ativoA, ativoB) => ativoA.ticker.localeCompare(ativoB.ticker));
            break;
        case 'nota':
            listaProcessada.sort((ativoA, ativoB) => ativoB.nota - ativoA.nota);
            break;
        case 'projecao':
            listaProcessada.sort((ativoA, ativoB) => ativoB.rendaMensalEstimada - ativoA.rendaMensalEstimada);
            break;
        case 'maior-posicao':
        default:
            listaProcessada.sort((ativoA, ativoB) => ativoB.valorTotalAtual - ativoA.valorTotalAtual);
            break;
    }

    return listaProcessada;
}

export function gerarListaAlertas(listaAtivos) {
    const diaAtual = new Date().getDate();
    const listaAlertas = [];

    listaAtivos.forEach((ativo) => {
        if (ativo.precoTeto > 0 && ativo.precoAtual > ativo.precoTeto) {
            listaAlertas.push({
                ticker: ativo.ticker,
                tipo: 'Acima do teto',
                classeSelo: 'acima-teto',
                classeCartao: 'alerta-vermelho',
                mensagem: 'O ativo está acima do preço teto definido. Considere revisar a tese ou aguardar melhor ponto de entrada.',
                precoAtual: ativo.precoAtual
            });
        }

        if (ativo.diaDataCom && calcularDistanciaCircularEntreDias(ativo.diaDataCom, diaAtual) <= 3) {
            listaAlertas.push({
                ticker: ativo.ticker,
                tipo: 'Data com',
                classeSelo: 'data-proxima',
                classeCartao: 'alerta-azul',
                mensagem: 'A data com está próxima. Bom momento para revisar posição, calendário e estratégia de aporte.',
                precoAtual: ativo.precoAtual
            });
        }

        if (ativo.emWatchlist && ativo.precoTeto > 0 && ativo.precoAtual > 0 && ativo.precoAtual <= ativo.precoTeto) {
            listaAlertas.push({
                ticker: ativo.ticker,
                tipo: 'Watchlist',
                classeSelo: 'watchlist',
                classeCartao: 'alerta-rosa',
                mensagem: 'Ativo da watchlist negociando dentro do preço teto. Pode ser um candidato para avaliação mais profunda.',
                precoAtual: ativo.precoAtual
            });
        }

        if (ativo.origemCalculoPosicao === 'aportes') {
            listaAlertas.push({
                ticker: ativo.ticker,
                tipo: 'Preço médio real',
                classeSelo: 'favorito',
                classeCartao: 'alerta-azul',
                mensagem: `Este ativo está usando o histórico de aportes como base principal do preço médio e da quantidade.`,
                precoAtual: ativo.precoAtual
            });
        }
    });

    return listaAlertas;
}

export function gerarSimulacaoGlobalDeAporte(valorTotalAporte, listaRanking) {
    const valorAporteSeguro = converterParaNumeroSeguro(valorTotalAporte, 0);

    if (valorAporteSeguro <= 0 || !listaRanking.length) {
        return {
            valorTotalAporte: 0,
            valorDistribuido: 0,
            saldoResidual: 0,
            listaDistribuicao: []
        };
    }

    const listaElegivel = listaRanking
        .filter((ativo) => ativo.precoAtual > 0)
        .slice(0, 5);

    if (!listaElegivel.length) {
        return {
            valorTotalAporte: valorAporteSeguro,
            valorDistribuido: 0,
            saldoResidual: valorAporteSeguro,
            listaDistribuicao: []
        };
    }

    const somaDosScores = listaElegivel.reduce((soma, ativo) => soma + converterParaNumeroSeguro(ativo.score, 0), 0);

    const listaDistribuicao = listaElegivel.map((ativo) => {
        const peso = somaDosScores > 0 ? ativo.score / somaDosScores : 1 / listaElegivel.length;
        const valorSugerido = valorAporteSeguro * peso;
        const quantidadeEstimativa = ativo.precoAtual > 0 ? Math.floor(valorSugerido / ativo.precoAtual) : 0;

        return {
            id: ativo.id,
            ticker: ativo.ticker,
            segmento: ativo.segmento,
            score: ativo.score,
            valorSugerido,
            quantidadeEstimativa
        };
    });

    const valorDistribuido = listaDistribuicao.reduce((soma, item) => soma + item.valorSugerido, 0);
    const saldoResidual = Math.max(0, valorAporteSeguro - valorDistribuido);

    return {
        valorTotalAporte: valorAporteSeguro,
        valorDistribuido,
        saldoResidual,
        listaDistribuicao
    };
}
