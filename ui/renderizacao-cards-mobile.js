import {
    escaparHtml,
    formatarMoeda,
    formatarPercentual,
    obterClasseResultadoValor
} from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function montarBotaoAcao(texto, classe, atributoData, valorData) {
    return `<button type="button" class="botao-acao-tabela ${classe}" ${atributoData}="${escaparHtml(valorData)}">${escaparHtml(texto)}</button>`;
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

export function renderizarCardsMobileAtivos({
    listaCardsMobileAtivos,
    listaAtivos,
    filtroSegmentoAtual,
    ordenacaoCarteiraAtual,
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
        listaCardsMobileAtivos.innerHTML = `
            <div class="glass p-6 rounded-[2rem] text-center text-slate-500 italic">
                Nenhum ativo encontrado.
            </div>
        `;
        return;
    }

    const patrimonioTotal = listaOrdenada.reduce(
        (soma, ativo) => soma + converterParaNumeroSeguro(ativo.valorTotalAtual, 0),
        0
    );

    const somaDasNotas = listaOrdenada.reduce(
        (soma, ativo) => soma + converterParaNumeroSeguro(ativo.nota, 0),
        0
    );

    listaCardsMobileAtivos.innerHTML = listaOrdenada.map((ativo) => {
        const statusAtivo = obterStatusAtivo(ativo, patrimonioTotal, somaDasNotas);
        const estaExpandido = Boolean(mapaLinhasExpandidas?.[ativo.id]);
        const estaSelecionadoParaComparacao = (listaAtivosSelecionadosParaComparacao || []).includes(ativo.id);
        const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);

        return `
            <div class="cartao-ativo-mobile">
                <div class="cartao-ativo-mobile-topo">
                    <div class="cartao-ativo-mobile-titulo">
                        <span class="cartao-ativo-mobile-ticker">${escaparHtml(ativo.ticker)}</span>
                        <span class="text-[10px] text-slate-500 uppercase font-black">${escaparHtml(ativo.segmento || 'Outros')}</span>

                        <div class="flex flex-wrap gap-2 mt-1">
                            <span class="selo-status ${escaparHtml(statusAtivo.tipoStatus)}">${escaparHtml(statusAtivo.textoStatus)}</span>
                            ${montarSeloFontePreco(ativo)}
                            ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                            ${ativo.emWatchlist ? '<span class="selo-status watchlist">Watchlist</span>' : ''}
                            ${estaSelecionadoParaComparacao ? '<span class="selo-status ranking">No comparador</span>' : ''}
                        </div>
                    </div>
                </div>

                <div class="cartao-ativo-mobile-grade">
                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Preço atual</div>
                        <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtual, 0))}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Preço teto</div>
                        <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoTeto, 0))}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Quantidade</div>
                        <div class="cartao-ativo-mobile-valor">${formatarMoeda(converterParaNumeroSeguro(ativo.quantidade, 0), 0)}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Patrimônio</div>
                        <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.valorTotalAtual, 0))}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Renda mensal</div>
                        <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0))}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Lucro / Prejuízo</div>
                        <div class="cartao-ativo-mobile-valor ${classeResultado}">
                            R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.lucroPrejuizoValor, 0))}
                        </div>
                    </div>
                </div>

                <div class="cartao-ativo-mobile-acoes">
                    ${montarBotaoAcao('Detalhes', 'botao-detalhes-ativo', 'data-id', ativo.id)}
                    ${montarBotaoAcao('Editar', 'botao-editar-ativo', 'data-id', ativo.id)}
                    ${montarBotaoAcao('Excluir', 'botao-excluir-ativo', 'data-id', ativo.id)}
                    ${montarBotaoAcao('Provento', 'botao-registrar-provento', 'data-ticker', ativo.ticker)}
                    ${montarBotaoAcao(ativo.favorito ? 'Desfavoritar' : 'Favoritar', 'botao-alternar-favorito', 'data-id', ativo.id)}
                    ${montarBotaoAcao(ativo.emWatchlist ? 'Remover watchlist' : 'Watchlist', 'botao-alternar-watchlist', 'data-id', ativo.id)}
                    ${montarBotaoAcao('Comparar', 'botao-alternar-comparador', 'data-id', ativo.id)}
                </div>

                ${estaExpandido ? `
                    <div class="cartao-ativo-mobile-detalhes">
                        <div class="grid grid-cols-1 gap-3">
                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Preço médio</div>
                                <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoMedio, 0))}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Preço atual manual</div>
                                <div class="cartao-ativo-mobile-valor">
                                    ${converterParaNumeroSeguro(ativo.precoAtualManual, 0) > 0 ? `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtualManual, 0))}` : '--'}
                                </div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Origem do preço</div>
                                <div class="cartao-ativo-mobile-valor">${escaparHtml(ativo.fontePrecoAtual || '--')}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Nota</div>
                                <div class="cartao-ativo-mobile-valor">${formatarMoeda(converterParaNumeroSeguro(ativo.nota, 0), 0)}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Alocação atual</div>
                                <div class="cartao-ativo-mobile-valor">${formatarPercentual(converterParaNumeroSeguro(statusAtivo.percentualAlocacaoAtual, 0))}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Alocação alvo</div>
                                <div class="cartao-ativo-mobile-valor">${formatarPercentual(converterParaNumeroSeguro(statusAtivo.percentualAlocacaoAlvo, 0))}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Data com</div>
                                <div class="cartao-ativo-mobile-valor">${ativo.diaDataCom ? `Dia ${escaparHtml(ativo.diaDataCom)}` : '--'}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Pagamento</div>
                                <div class="cartao-ativo-mobile-valor">${ativo.diaPagamento ? `Dia ${escaparHtml(ativo.diaPagamento)}` : '--'}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Observação</div>
                                <div class="area-observacao-detalhes">${escaparHtml(ativo.observacao || 'Sem observações cadastradas.')}</div>
                            </div>

                            <div class="cartao-ativo-mobile-campo">
                                <div class="cartao-ativo-mobile-rotulo">Observação da watchlist</div>
                                <textarea
                                    class="textarea-watchlist campo-observacao-watchlist"
                                    data-id="${escaparHtml(ativo.id)}"
                                    placeholder="Escreva observações para acompanhar este ativo..."
                                >${escaparHtml(ativo.observacaoWatchlist || '')}</textarea>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}