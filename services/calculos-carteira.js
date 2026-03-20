import { normalizarTicker } from './formatadores.js';

export function converterParaNumeroSeguro(valor, valorPadrao = 0) {
    const numeroConvertido = Number(valor);

    if (!Number.isFinite(numeroConvertido)) {
        return valorPadrao;
    }

    return numeroConvertido;
}

export function calcularDistanciaCircularEntreDias(diaEvento, diaAtual) {
    const diaEventoConvertido = Number(diaEvento);
    const diaAtualConvertido = Number(diaAtual);

    if (!Number.isInteger(diaEventoConvertido) || !Number.isInteger(diaAtualConvertido)) {
        return 999;
    }

    if (diaEventoConvertido >= diaAtualConvertido) {
        return diaEventoConvertido - diaAtualConvertido;
    }

    return (31 - diaAtualConvertido) + diaEventoConvertido;
}

function calcularResumoAportesPorTicker(listaAportes) {
    const mapaResumo = {};

    listaAportes.forEach((aporte) => {
        const tickerNormalizado = normalizarTicker(aporte.ticker);

        if (!tickerNormalizado) {
            return;
        }

        const quantidadeComprada = converterParaNumeroSeguro(aporte.quantidadeComprada, 0);
        const precoPorCota = converterParaNumeroSeguro(aporte.precoPorCota, 0);
        const valorTotalCompra = quantidadeComprada * precoPorCota;

        if (!mapaResumo[tickerNormalizado]) {
            mapaResumo[tickerNormalizado] = {
                quantidadeTotal: 0,
                valorTotalInvestido: 0
            };
        }

        mapaResumo[tickerNormalizado].quantidadeTotal += quantidadeComprada;
        mapaResumo[tickerNormalizado].valorTotalInvestido += valorTotalCompra;
    });

    return mapaResumo;
}

function calcularPrecoAtualDoMapa(mapaCotacoes, ticker) {
    if (!mapaCotacoes || !ticker) {
        return 0;
    }

    const itemCotacao = mapaCotacoes[normalizarTicker(ticker)];

    if (!itemCotacao) {
        return 0;
    }

    if (Number.isFinite(Number(itemCotacao.regularMarketPrice))) {
        return Number(itemCotacao.regularMarketPrice);
    }

    if (Number.isFinite(Number(itemCotacao.price))) {
        return Number(itemCotacao.price);
    }

    return 0;
}

function obterOrigemCalculoPosicao(resumoAportesTicker, quantidadeCadastro, precoMedioCadastro) {
    if (
        resumoAportesTicker &&
        resumoAportesTicker.quantidadeTotal > 0 &&
        resumoAportesTicker.valorTotalInvestido > 0
    ) {
        return 'aportes';
    }

    if (quantidadeCadastro > 0 && precoMedioCadastro > 0) {
        return 'cadastro';
    }

    return 'cadastro';
}

function escolherPrecoAtualFinal(ativoBruto, mapaCotacoes, tickerNormalizado) {
    const precoAtualManual = converterParaNumeroSeguro(ativoBruto.precoAtualManual, 0);

    if (precoAtualManual > 0) {
        return {
            precoAtual: precoAtualManual,
            fontePrecoAtual: 'manual'
        };
    }

    const precoAtualDaBrapiOuCache = calcularPrecoAtualDoMapa(mapaCotacoes, tickerNormalizado);

    if (precoAtualDaBrapiOuCache > 0) {
        const itemCotacao = mapaCotacoes?.[tickerNormalizado];
        return {
            precoAtual: precoAtualDaBrapiOuCache,
            fontePrecoAtual: itemCotacao?.fonteCotacao || 'brapi'
        };
    }

    return {
        precoAtual: 0,
        fontePrecoAtual: 'indisponivel'
    };
}

export function enriquecerListaAtivos(listaAtivosBruta, mapaCotacoes = {}, listaAportes = []) {
    const mapaResumoAportesPorTicker = calcularResumoAportesPorTicker(listaAportes);

    return listaAtivosBruta.map((ativoBruto) => {
        const tickerNormalizado = normalizarTicker(ativoBruto.ticker);

        const quantidadeCadastro = converterParaNumeroSeguro(ativoBruto.quantidade, 0);
        const precoMedioCadastro = converterParaNumeroSeguro(ativoBruto.precoMedio, 0);

        const resumoAportesTicker = mapaResumoAportesPorTicker[tickerNormalizado];
        const origemCalculoPosicao = obterOrigemCalculoPosicao(
            resumoAportesTicker,
            quantidadeCadastro,
            precoMedioCadastro
        );

        const quantidadeFinal = origemCalculoPosicao === 'aportes'
            ? converterParaNumeroSeguro(resumoAportesTicker.quantidadeTotal, quantidadeCadastro)
            : quantidadeCadastro;

        const valorTotalInvestido = origemCalculoPosicao === 'aportes'
            ? converterParaNumeroSeguro(resumoAportesTicker.valorTotalInvestido, quantidadeCadastro * precoMedioCadastro)
            : quantidadeCadastro * precoMedioCadastro;

        const precoMedioFinal = quantidadeFinal > 0
            ? valorTotalInvestido / quantidadeFinal
            : precoMedioCadastro;

        const resultadoPrecoAtual = escolherPrecoAtualFinal(
            ativoBruto,
            mapaCotacoes,
            tickerNormalizado
        );

        const precoAtual = resultadoPrecoAtual.precoAtual;
        const valorTotalAtual = quantidadeFinal * precoAtual;
        const lucroPrejuizoValor = valorTotalAtual - valorTotalInvestido;
        const lucroPrejuizoPercentual = valorTotalInvestido > 0
            ? (lucroPrejuizoValor / valorTotalInvestido) * 100
            : 0;

        const rendaMensalEstimada = quantidadeFinal * converterParaNumeroSeguro(ativoBruto.rendaMensalPorCota, 0);
        const rendaAnualEstimada = rendaMensalEstimada * 12;

        return {
            ...ativoBruto,
            ticker: tickerNormalizado,
            quantidade: quantidadeFinal,
            quantidadeCadastro,
            precoMedio: precoMedioFinal,
            precoMedioCadastro,
            precoAtualManual: converterParaNumeroSeguro(ativoBruto.precoAtualManual, 0),
            fontePrecoAtual: resultadoPrecoAtual.fontePrecoAtual,
            valorTotalInvestido,
            precoAtual,
            valorTotalAtual,
            lucroPrejuizoValor,
            lucroPrejuizoPercentual,
            rendaMensalEstimada,
            rendaAnualEstimada,
            nota: converterParaNumeroSeguro(ativoBruto.nota, 0),
            precoTeto: converterParaNumeroSeguro(ativoBruto.precoTeto, 0),
            diaDataCom: ativoBruto.diaDataCom ?? null,
            diaPagamento: ativoBruto.diaPagamento ?? null,
            segmento: ativoBruto.segmento || 'Outros',
            observacao: ativoBruto.observacao || '',
            favorito: Boolean(ativoBruto.favorito),
            emWatchlist: Boolean(ativoBruto.emWatchlist),
            origemCalculoPosicao
        };
    });
}

export function obterListaAtivosFiltradaEOrdenada(listaAtivos, filtroSegmentoAtual, ordenacaoCarteiraAtual) {
    const listaFiltrada = filtroSegmentoAtual === 'Todos'
        ? [...listaAtivos]
        : listaAtivos.filter((ativo) => ativo.segmento === filtroSegmentoAtual);

    const listaOrdenada = [...listaFiltrada];

    switch (ordenacaoCarteiraAtual) {
        case 'menor-posicao':
            listaOrdenada.sort((ativoA, ativoB) => ativoA.valorTotalAtual - ativoB.valorTotalAtual);
            break;

        case 'ticker':
            listaOrdenada.sort((ativoA, ativoB) => ativoA.ticker.localeCompare(ativoB.ticker));
            break;

        case 'nota':
            listaOrdenada.sort((ativoA, ativoB) => ativoB.nota - ativoA.nota);
            break;

        case 'projecao':
            listaOrdenada.sort((ativoA, ativoB) => ativoB.rendaMensalEstimada - ativoA.rendaMensalEstimada);
            break;

        case 'maior-posicao':
        default:
            listaOrdenada.sort((ativoA, ativoB) => ativoB.valorTotalAtual - ativoA.valorTotalAtual);
            break;
    }

    return listaOrdenada;
}

export function gerarListaAlertas(listaAtivos) {
    const listaAlertas = [];
    const diaAtual = new Date().getDate();

    listaAtivos.forEach((ativo) => {
        if (ativo.precoTeto > 0 && ativo.precoAtual > 0 && ativo.precoAtual > ativo.precoTeto) {
            listaAlertas.push({
                id: `${ativo.id}-acima-teto`,
                tipo: 'acima-do-teto',
                titulo: `${ativo.ticker} acima do teto`,
                descricao: `Preço atual acima do preço teto definido.`,
                ticker: ativo.ticker
            });
        }

        if (ativo.precoAtual <= 0) {
            listaAlertas.push({
                id: `${ativo.id}-sem-cotacao`,
                tipo: 'watchlist',
                titulo: `${ativo.ticker} sem preço atual`,
                descricao: 'Defina um preço manual ou aguarde cotação externa válida.',
                ticker: ativo.ticker
            });
        }

        if (ativo.diaDataCom) {
            const distanciaDataCom = calcularDistanciaCircularEntreDias(ativo.diaDataCom, diaAtual);

            if (distanciaDataCom >= 0 && distanciaDataCom <= 5) {
                listaAlertas.push({
                    id: `${ativo.id}-data-com-proxima`,
                    tipo: 'data-proxima',
                    titulo: `${ativo.ticker} com data com próxima`,
                    descricao: `Data com prevista para o dia ${ativo.diaDataCom}.`,
                    ticker: ativo.ticker
                });
            }
        }

        if (ativo.diaPagamento) {
            const distanciaPagamento = calcularDistanciaCircularEntreDias(ativo.diaPagamento, diaAtual);

            if (distanciaPagamento >= 0 && distanciaPagamento <= 5) {
                listaAlertas.push({
                    id: `${ativo.id}-pagamento-proximo`,
                    tipo: 'pagamento-proximo',
                    titulo: `${ativo.ticker} com pagamento próximo`,
                    descricao: `Pagamento previsto para o dia ${ativo.diaPagamento}.`,
                    ticker: ativo.ticker
                });
            }
        }

        if (ativo.emWatchlist) {
            listaAlertas.push({
                id: `${ativo.id}-watchlist`,
                tipo: 'watchlist',
                titulo: `${ativo.ticker} está em watchlist`,
                descricao: `Ativo marcado para observação.`,
                ticker: ativo.ticker
            });
        }
    });

    return listaAlertas;
}

export function gerarSimulacaoGlobalDeAporte(valorAporte, listaRanking) {
    const valorAporteConvertido = converterParaNumeroSeguro(valorAporte, 0);

    if (valorAporteConvertido <= 0 || !Array.isArray(listaRanking) || listaRanking.length === 0) {
        return {
            valorTotalAporte: valorAporteConvertido,
            listaSugestoes: []
        };
    }

    const listaBase = listaRanking.slice(0, 5);
    const somaScores = listaBase.reduce((soma, item) => soma + converterParaNumeroSeguro(item.score, 0), 0);

    if (somaScores <= 0) {
        return {
            valorTotalAporte: valorAporteConvertido,
            listaSugestoes: []
        };
    }

    const listaSugestoes = listaBase.map((itemRanking) => {
        const score = converterParaNumeroSeguro(itemRanking.score, 0);
        const percentualDistribuicao = score / somaScores;
        const valorSugerido = valorAporteConvertido * percentualDistribuicao;
        const precoAtual = converterParaNumeroSeguro(itemRanking.precoAtual, 0);

        const quantidadeSugerida = precoAtual > 0
            ? Math.floor(valorSugerido / precoAtual)
            : 0;

        return {
            id: itemRanking.id,
            ticker: itemRanking.ticker,
            score,
            percentualDistribuicao,
            valorSugerido,
            precoAtual,
            quantidadeSugerida
        };
    });

    return {
        valorTotalAporte: valorAporteConvertido,
        listaSugestoes
    };
}