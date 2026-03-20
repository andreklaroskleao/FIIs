import {
    escaparHtml,
    formatarMoeda,
    formatarPercentual,
    obterClasseResultadoValor
} from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function montarSeloStatus(tipoStatus, textoStatus) {
    return `<span class="selo-status ${escaparHtml(tipoStatus)}">${escaparHtml(textoStatus)}</span>`;
}

function montarSeloFontePreco(ativo) {
    if (ativo.fontePrecoAtual === 'manual') {
        return '<span class="selo-status peso-baixo">Preço manual</span>';
    }

    if (ativo.fontePrecoAtual === 'cache') {
        return '<span class="selo-status neutro">Cache</span>';
    }

    if (ativo.fontePrecoAtual === 'brapi') {
        return '<span class="selo-status oportunidade">BRAPI</span>';
    }

    return '<span class="selo-status acima-teto">Sem cotação</span>';
}

function montarBotoesAcoesAtivo(ativo) {
    return `
        <div class="flex flex-wrap justify-center gap-2">
            <button type="button" class="botao-acao-tabela botao-detalhes-ativo" data-id="${escaparHtml(ativo.id)}">Detalhes</button>
            <button type="button" class="botao-acao-tabela botao-editar-ativo" data-id="${escaparHtml(ativo.id)}">Editar</button>
            <button type="button" class="botao-acao-tabela botao-excluir-ativo" data-id="${escaparHtml(ativo.id)}">Excluir</button>
            <button type="button" class="botao-acao-tabela botao-registrar-provento" data-ticker="${escaparHtml(ativo.ticker)}">Provento</button>
            <button type="button" class="botao-acao-tabela botao-alternar-favorito" data-id="${escaparHtml(ativo.id)}">${ativo.favorito ? 'Desfavoritar' : 'Favoritar'}</button>
            <button type="button" class="botao-acao-tabela botao-alternar-watchlist" data-id="${escaparHtml(ativo.id)}">${ativo.emWatchlist ? 'Remover watchlist' : 'Watchlist'}</button>
            <button type="button" class="botao-acao-tabela botao-alternar-comparador" data-id="${escaparHtml(ativo.id)}">Comparar</button>
        </div>
    `;
}

function montarLinhaExpandida({
    ativo,
    statusAtivo,
    mapaLinhasExpandidas,
    listaAtivosSelecionadosParaComparacao,
    quantidadeColunas
}) {
    const estaExpandido = Boolean(mapaLinhasExpandidas?.[ativo.id]);

    if (!estaExpandido) {
        return '';
    }

    const estaSelecionadoParaComparacao = (listaAtivosSelecionadosParaComparacao || []).includes(ativo.id);
    const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);

    return `
        <tr class="linha-expandida">
            <td colspan="${quantidadeColunas}">
                <div class="cartao-detalhes-ativo">
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <div>
                            <div class="titulo-cartao-detalhes">Ticker</div>
                            <div class="valor-destaque-detalhes">${escaparHtml(ativo.ticker)}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Segmento</div>
                            <div class="valor-destaque-detalhes">${escaparHtml(ativo.segmento || 'Outros')}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Nota</div>
                            <div class="valor-destaque-detalhes">${formatarMoeda(converterParaNumeroSeguro(ativo.nota, 0), 0)}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Preço teto</div>
                            <div class="valor-destaque-detalhes">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoTeto, 0))}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Preço médio</div>
                            <div class="valor-destaque-detalhes">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoMedio, 0))}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Preço atual</div>
                            <div class="valor-destaque-detalhes">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtual, 0))}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Preço atual manual</div>
                            <div class="valor-destaque-detalhes">
                                ${converterParaNumeroSeguro(ativo.precoAtualManual, 0) > 0 ? `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtualManual, 0))}` : '--'}
                            </div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Origem do preço</div>
                            <div class="valor-destaque-detalhes">${escaparHtml(ativo.fontePrecoAtual || '--')}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Lucro / Prejuízo</div>
                            <div class="valor-destaque-detalhes ${classeResultado}">
                                R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.lucroPrejuizoValor, 0))}
                                (${formatarPercentual(converterParaNumeroSeguro(ativo.lucroPrejuizoPercentual, 0))})
                            </div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Renda mensal estimada</div>
                            <div class="valor-destaque-detalhes">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0))}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Alocação atual</div>
                            <div class="valor-destaque-detalhes">${formatarPercentual(converterParaNumeroSeguro(statusAtivo.percentualAlocacaoAtual, 0))}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Alocação alvo</div>
                            <div class="valor-destaque-detalhes">${formatarPercentual(converterParaNumeroSeguro(statusAtivo.percentualAlocacaoAlvo, 0))}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Data com</div>
                            <div class="valor-destaque-detalhes">${ativo.diaDataCom ? `Dia ${escaparHtml(ativo.diaDataCom)}` : '--'}</div>
                        </div>

                        <div>
                            <div class="titulo-cartao-detalhes">Pagamento</div>
                            <div class="valor-destaque-detalhes">${ativo.diaPagamento ? `Dia ${escaparHtml(ativo.diaPagamento)}` : '--'}</div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <div class="titulo-cartao-detalhes">Estado do ativo</div>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${montarSeloStatus(statusAtivo.tipoStatus, statusAtivo.textoStatus)}
                            ${montarSeloFontePreco(ativo)}
                            ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                            ${ativo.emWatchlist ? '<span class="selo-status watchlist">Watchlist</span>' : ''}
                            ${estaSelecionadoParaComparacao ? '<span class="selo-status ranking">No comparador</span>' : ''}
                        </div>
                    </div>

                    <div class="mt-4">
                        <div class="titulo-cartao-detalhes">Observação</div>
                        <div class="area-observacao-detalhes">${escaparHtml(ativo.observacao || 'Sem observações cadastradas.')}</div>
                    </div>

                    <div class="mt-4">
                        <div class="titulo-cartao-detalhes">Observação da watchlist</div>
                        <textarea
                            class="textarea-watchlist campo-observacao-watchlist"
                            data-id="${escaparHtml(ativo.id)}"
                            placeholder="Escreva observações para acompanhar este ativo..."
                        >${escaparHtml(ativo.observacaoWatchlist || '')}</textarea>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

export function renderizarTabelaAtivos({
    corpoTabelaAtivos,
    listaAtivos,
    filtroSegmentoAtual,
    ordenacaoCarteiraAtual,
    caixaDisponivel,
    mapaLinhasExpandidas,
    listaAtivosSelecionadosParaComparacao,
    obterListaAtivosFiltradaEOrdenada,
    obterStatusAtivo
}) {
    const listaOrdenada = obterListaAtivosFiltradaEOrdenada(
        listaAtivos || [],
        filtroSegmentoAtual,
        ordenacaoCarteiraAtual
    );

    if (!Array.isArray(listaOrdenada) || listaOrdenada.length === 0) {
        corpoTabelaAtivos.innerHTML = `
            <tr>
                <td colspan="7" class="p-10 text-center text-slate-500 italic">
                    Nenhum ativo encontrado.
                </td>
            </tr>
        `;

        return {
            patrimonioTotal: 0,
            projecaoMensalTotal: 0,
            valorTotalInvestidoCarteira: 0,
            listaSugestoesRebalanceamento: []
        };
    }

    const patrimonioTotal = listaOrdenada.reduce(
        (soma, ativo) => soma + converterParaNumeroSeguro(ativo.valorTotalAtual, 0),
        0
    );

    const projecaoMensalTotal = listaOrdenada.reduce(
        (soma, ativo) => soma + converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0),
        0
    );

    const valorTotalInvestidoCarteira = listaOrdenada.reduce(
        (soma, ativo) => soma + converterParaNumeroSeguro(ativo.valorTotalInvestido, 0),
        0
    );

    const somaDasNotas = listaOrdenada.reduce(
        (soma, ativo) => soma + converterParaNumeroSeguro(ativo.nota, 0),
        0
    );

    const listaSugestoesRebalanceamento = listaOrdenada.map((ativo) => {
        const statusAtivo = obterStatusAtivo(ativo, patrimonioTotal, somaDasNotas);
        const precoAtual = converterParaNumeroSeguro(ativo.precoAtual, 0);
        const quantidadeSugerida = precoAtual > 0
            ? Math.floor(converterParaNumeroSeguro(caixaDisponivel, 0) / precoAtual)
            : 0;

        return {
            id: ativo.id,
            ticker: ativo.ticker,
            nota: ativo.nota,
            quantidadeSugerida,
            ...statusAtivo
        };
    });

    corpoTabelaAtivos.innerHTML = listaOrdenada.map((ativo) => {
        const statusAtivo = obterStatusAtivo(ativo, patrimonioTotal, somaDasNotas);
        const percentualAlocacao = patrimonioTotal > 0
            ? (converterParaNumeroSeguro(ativo.valorTotalAtual, 0) / patrimonioTotal) * 100
            : 0;

        const linhaPrincipal = `
            <tr>
                <td>
                    <div class="flex flex-col gap-2">
                        <div class="font-black text-emerald-400">${escaparHtml(ativo.ticker)}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-black">${escaparHtml(ativo.segmento || 'Outros')}</div>
                        <div class="flex flex-wrap gap-2">
                            ${montarSeloStatus(statusAtivo.tipoStatus, statusAtivo.textoStatus)}
                            ${montarSeloFontePreco(ativo)}
                            ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                            ${ativo.emWatchlist ? '<span class="selo-status watchlist">Watchlist</span>' : ''}
                        </div>
                    </div>
                </td>

                <td>
                    <div class="flex flex-col gap-1">
                        <span>Atual: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtual, 0))}</strong></span>
                        <span>Teto: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoTeto, 0))}</strong></span>
                        <span>Médio: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoMedio, 0))}</strong></span>
                    </div>
                </td>

                <td>
                    <div class="flex flex-col gap-1">
                        <span>Data com: <strong>${ativo.diaDataCom ? `Dia ${escaparHtml(ativo.diaDataCom)}` : '--'}</strong></span>
                        <span>Pagamento: <strong>${ativo.diaPagamento ? `Dia ${escaparHtml(ativo.diaPagamento)}` : '--'}</strong></span>
                    </div>
                </td>

                <td>
                    <div class="flex flex-col gap-1">
                        <span>Mensal: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0))}</strong></span>
                        <span>Anual: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.rendaAnualEstimada, 0))}</strong></span>
                    </div>
                </td>

                <td>
                    <div class="flex flex-col gap-1">
                        <span>Qtd: <strong>${formatarMoeda(converterParaNumeroSeguro(ativo.quantidade, 0), 0)}</strong></span>
                        <span>Patrimônio: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.valorTotalAtual, 0))}</strong></span>
                    </div>
                </td>

                <td>
                    <div class="flex flex-col gap-2">
                        <span><strong>${formatarPercentual(percentualAlocacao)}</strong></span>
                        <div class="barra-alocacao-container">
                            <div class="barra-alocacao-real" style="width: ${Math.min(100, percentualAlocacao)}%;"></div>
                            <div class="marcador-alocacao-alvo" style="left: ${Math.min(100, statusAtivo.percentualAlocacaoAlvo)}%;"></div>
                        </div>
                    </div>
                </td>

                <td class="text-center">
                    ${montarBotoesAcoesAtivo(ativo)}
                </td>
            </tr>
        `;

        const linhaExpandida = montarLinhaExpandida({
            ativo,
            statusAtivo,
            mapaLinhasExpandidas,
            listaAtivosSelecionadosParaComparacao,
            quantidadeColunas: 7
        });

        return linhaPrincipal + linhaExpandida;
    }).join('');

    return {
        patrimonioTotal,
        projecaoMensalTotal,
        valorTotalInvestidoCarteira,
        listaSugestoesRebalanceamento
    };
}