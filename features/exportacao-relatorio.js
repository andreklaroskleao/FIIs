import { formatarMoeda, formatarPercentual } from '../services/formatadores.js';

function adicionarLinha(listaLinhas, texto = '') {
    listaLinhas.push(texto);
}

function adicionarTituloSecao(listaLinhas, titulo) {
    adicionarLinha(listaLinhas, '');
    adicionarLinha(listaLinhas, '============================================================');
    adicionarLinha(listaLinhas, titulo.toUpperCase());
    adicionarLinha(listaLinhas, '============================================================');
}

export function gerarConteudoRelatorioCarteira({
    patrimonioTotal,
    rendaMensal,
    yieldOnCost,
    quedaEstimada,
    listaFavoritos,
    listaWatchlist,
    listaAlertas,
    listaRanking,
    listaEventosCalendario,
    listaAtivos
}) {
    const listaLinhas = [];

    adicionarLinha(listaLinhas, 'RELATÓRIO DA CARTEIRA - FII INSIGHT');
    adicionarLinha(listaLinhas, `Gerado em: ${new Date().toLocaleString('pt-BR')}`);

    adicionarTituloSecao(listaLinhas, 'Resumo Geral');
    adicionarLinha(listaLinhas, `Patrimônio total: R$ ${formatarMoeda(patrimonioTotal)}`);
    adicionarLinha(listaLinhas, `Renda mensal estimada: R$ ${formatarMoeda(rendaMensal)}`);
    adicionarLinha(listaLinhas, `Yield on Cost: ${formatarPercentual(yieldOnCost)}`);
    adicionarLinha(listaLinhas, `Risco em estresse (5%): - R$ ${formatarMoeda(quedaEstimada)}`);

    adicionarTituloSecao(listaLinhas, 'Ativos');
    if ((listaAtivos || []).length === 0) {
        adicionarLinha(listaLinhas, 'Nenhum ativo cadastrado.');
    } else {
        (listaAtivos || []).forEach((ativo) => {
            adicionarLinha(
                listaLinhas,
                `${ativo.ticker} | Segmento: ${ativo.segmento} | Quantidade: ${ativo.quantidade} | Preço médio: R$ ${formatarMoeda(ativo.precoMedio)} | Preço atual: R$ ${formatarMoeda(ativo.precoAtual)} | Patrimônio: R$ ${formatarMoeda(ativo.valorTotalAtual)}`
            );
        });
    }

    adicionarTituloSecao(listaLinhas, 'Favoritos');
    if ((listaFavoritos || []).length === 0) {
        adicionarLinha(listaLinhas, 'Nenhum ativo favorito.');
    } else {
        listaFavoritos.forEach((ativo) => {
            adicionarLinha(listaLinhas, `${ativo.ticker} | Nota: ${ativo.nota} | Segmento: ${ativo.segmento}`);
        });
    }

    adicionarTituloSecao(listaLinhas, 'Watchlist');
    if ((listaWatchlist || []).length === 0) {
        adicionarLinha(listaLinhas, 'Nenhum ativo em watchlist.');
    } else {
        listaWatchlist.forEach((ativo) => {
            adicionarLinha(listaLinhas, `${ativo.ticker} | Nota: ${ativo.nota} | Segmento: ${ativo.segmento}`);
        });
    }

    adicionarTituloSecao(listaLinhas, 'Alertas');
    if ((listaAlertas || []).length === 0) {
        adicionarLinha(listaLinhas, 'Nenhum alerta no momento.');
    } else {
        listaAlertas.forEach((alerta) => {
            adicionarLinha(listaLinhas, `${alerta.titulo} - ${alerta.descricao}`);
        });
    }

    adicionarTituloSecao(listaLinhas, 'Ranking de Oportunidades');
    if ((listaRanking || []).length === 0) {
        adicionarLinha(listaLinhas, 'Sem ativos para ranquear.');
    } else {
        listaRanking.slice(0, 10).forEach((itemRanking) => {
            adicionarLinha(
                listaLinhas,
                `#${itemRanking.posicaoRanking} ${itemRanking.ticker} | Score: ${formatarMoeda(itemRanking.score)} | Preço atual: R$ ${formatarMoeda(itemRanking.precoAtual)} | Preço teto: R$ ${formatarMoeda(itemRanking.precoTeto)}`
            );
        });
    }

    adicionarTituloSecao(listaLinhas, 'Calendário');
    if ((listaEventosCalendario || []).length === 0) {
        adicionarLinha(listaLinhas, 'Nenhum evento de calendário disponível.');
    } else {
        listaEventosCalendario.slice(0, 15).forEach((evento) => {
            adicionarLinha(
                listaLinhas,
                `${evento.ticker} | ${evento.tipo} | Dia ${evento.dia} | Em ${evento.distanciaDias} dia(s)`
            );
        });
    }

    adicionarLinha(listaLinhas, '');
    return listaLinhas.join('\n');
}

export function exportarRelatorioCarteiraComoTxt(nomeArquivo, conteudoRelatorio) {
    const blob = new Blob([conteudoRelatorio], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const elementoLink = document.createElement('a');

    elementoLink.href = url;
    elementoLink.download = nomeArquivo;
    document.body.appendChild(elementoLink);
    elementoLink.click();
    document.body.removeChild(elementoLink);
    URL.revokeObjectURL(url);
}