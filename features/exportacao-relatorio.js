import { formatarMoeda } from '../services/formatadores.js';

function gerarLinhaSeparadora() {
    return '============================================================';
}

function gerarSecaoTitulo(titulo) {
    return `\n${gerarLinhaSeparadora()}\n${titulo}\n${gerarLinhaSeparadora()}\n`;
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
    const linhasRelatorio = [];

    linhasRelatorio.push('FII Insight - Relatório da Carteira');
    linhasRelatorio.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);

    linhasRelatorio.push(gerarSecaoTitulo('Resumo Geral'));
    linhasRelatorio.push(`Patrimônio total: R$ ${formatarMoeda(patrimonioTotal)}`);
    linhasRelatorio.push(`Renda mensal estimada: R$ ${formatarMoeda(rendaMensal)}`);
    linhasRelatorio.push(`Yield on Cost médio: ${yieldOnCost.toFixed(2)}%`);
    linhasRelatorio.push(`Risco em estresse (5%): - R$ ${formatarMoeda(quedaEstimada)}`);
    linhasRelatorio.push(`Quantidade de ativos: ${listaAtivos.length}`);

    linhasRelatorio.push(gerarSecaoTitulo('Favoritos'));
    if (listaFavoritos.length) {
        listaFavoritos.forEach((ativo) => {
            linhasRelatorio.push(
                `${ativo.ticker} | Segmento: ${ativo.segmento} | Preço atual: R$ ${formatarMoeda(ativo.precoAtual)} | Renda mensal: R$ ${formatarMoeda(ativo.rendaMensalEstimada)}`
            );
        });
    } else {
        linhasRelatorio.push('Nenhum ativo favorito.');
    }

    linhasRelatorio.push(gerarSecaoTitulo('Watchlist'));
    if (listaWatchlist.length) {
        listaWatchlist.forEach((ativo) => {
            linhasRelatorio.push(
                `${ativo.ticker} | Segmento: ${ativo.segmento} | Preço atual: R$ ${formatarMoeda(ativo.precoAtual)} | Preço teto: R$ ${formatarMoeda(ativo.precoTeto)}`
            );
        });
    } else {
        linhasRelatorio.push('Nenhum ativo em watchlist.');
    }

    linhasRelatorio.push(gerarSecaoTitulo('Alertas'));
    if (listaAlertas.length) {
        listaAlertas.forEach((alerta) => {
            linhasRelatorio.push(
                `${alerta.ticker} | ${alerta.tipo} | ${alerta.mensagem}`
            );
        });
    } else {
        linhasRelatorio.push('Nenhum alerta no momento.');
    }

    linhasRelatorio.push(gerarSecaoTitulo('Ranking de Oportunidades'));
    if (listaRanking.length) {
        listaRanking.slice(0, 10).forEach((ativo, indice) => {
            linhasRelatorio.push(
                `${indice + 1}. ${ativo.ticker} | Score: ${ativo.score.toFixed(1)} | Segmento: ${ativo.segmento} | Renda mensal: R$ ${formatarMoeda(ativo.rendaMensalEstimada)}`
            );
        });
    } else {
        linhasRelatorio.push('Sem ativos ranqueados.');
    }

    linhasRelatorio.push(gerarSecaoTitulo('Calendário da Carteira'));
    if (listaEventosCalendario.length) {
        listaEventosCalendario.forEach((eventoCalendario) => {
            linhasRelatorio.push(
                `${eventoCalendario.ticker} | ${eventoCalendario.tipo} | Dia ${eventoCalendario.dia} | Em ${eventoCalendario.distanciaDias} dia(s)`
            );
        });
    } else {
        linhasRelatorio.push('Nenhum evento disponível.');
    }

    linhasRelatorio.push(gerarSecaoTitulo('Ativos da Carteira'));
    if (listaAtivos.length) {
        listaAtivos.forEach((ativo) => {
            linhasRelatorio.push(
                `${ativo.ticker} | Segmento: ${ativo.segmento} | Quantidade: ${ativo.quantidade} | Preço atual: R$ ${formatarMoeda(ativo.precoAtual)} | Valor atual: R$ ${formatarMoeda(ativo.valorTotalAtual)}`
            );
        });
    } else {
        linhasRelatorio.push('Nenhum ativo cadastrado.');
    }

    return linhasRelatorio.join('\n');
}

export function exportarRelatorioCarteiraComoTxt(nomeArquivo, conteudoRelatorio) {
    const blobArquivo = new Blob([conteudoRelatorio], { type: 'text/plain;charset=utf-8' });
    const urlArquivo = URL.createObjectURL(blobArquivo);

    const elementoLink = document.createElement('a');
    elementoLink.href = urlArquivo;
    elementoLink.download = nomeArquivo;
    document.body.appendChild(elementoLink);
    elementoLink.click();
    document.body.removeChild(elementoLink);

    URL.revokeObjectURL(urlArquivo);
}
