import { escaparHtml, formatarMoeda, obterClasseResultadoValor } from '../services/formatadores.js';
import { calcularScoreAtivo } from '../features/score-oportunidade.js';

function renderizarBlocoCampo(rotulo, valor, classesAdicionais = '') {
    return `
        <div class="cartao-ativo-mobile-campo">
            <div class="cartao-ativo-mobile-rotulo">${escaparHtml(rotulo)}</div>
            <div class="cartao-ativo-mobile-valor ${classesAdicionais}">${valor}</div>
        </div>
    `;
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
    const listaAtivosFiltradaEOrdenada = obterListaAtivosFiltradaEOrdenada(
        listaAtivos,
        filtroSegmentoAtual,
        ordenacaoCarteiraAtual
    );

    let patrimonioTotal = 0;
    let somaDasNotas = 0;

    listaAtivos.forEach((ativo) => {
        patrimonioTotal += ativo.valorTotalAtual;
        somaDasNotas += ativo.nota;
    });

    if (!listaAtivosFiltradaEOrdenada.length) {
        listaCardsMobileAtivos.innerHTML = `
            <div class="glass p-6 rounded-[2rem] text-center text-slate-500 italic">
                Nenhum ativo corresponde aos filtros.
            </div>
        `;
        return;
    }

    listaCardsMobileAtivos.innerHTML = listaAtivosFiltradaEOrdenada.map((ativo) => {
        const pesoIdeal = somaDasNotas > 0 ? ativo.nota / somaDasNotas : 0;
        const pesoReal = patrimonioTotal > 0 ? ativo.valorTotalAtual / patrimonioTotal : 0;
        const scoreAtivo = calcularScoreAtivo(ativo, pesoReal, pesoIdeal);
        const statusAtivo = obterStatusAtivo(ativo, pesoReal, pesoIdeal);
        const estaNoComparador = listaAtivosSelecionadosParaComparacao.includes(ativo.id);
        const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);

        return `
            <div class="cartao-ativo-mobile">
                <div class="cartao-ativo-mobile-topo">
                    <div class="cartao-ativo-mobile-titulo">
                        <span class="cartao-ativo-mobile-ticker">${escaparHtml(ativo.ticker)}</span>
                        <div class="flex flex-wrap gap-2">
                            <span class="selo-status ${statusAtivo.classe}">${escaparHtml(statusAtivo.rotulo)}</span>
                            ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                            ${ativo.emWatchlist ? '<span class="selo-status watchlist">Watchlist</span>' : ''}
                        </div>
                    </div>

                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 font-black uppercase">${escaparHtml(ativo.segmento)}</div>
                        <div class="text-[10px] text-blue-300 font-black mt-1">Nota ${ativo.nota}</div>
                    </div>
                </div>

                <div class="cartao-ativo-mobile-grade">
                    ${renderizarBlocoCampo('Preço atual', ativo.precoAtual > 0 ? `R$ ${formatarMoeda(ativo.precoAtual)}` : 'API OFF', 'valor-sensivel')}
                    ${renderizarBlocoCampo('Preço teto', `R$ ${formatarMoeda(ativo.precoTeto)}`, 'valor-sensivel')}
                    ${renderizarBlocoCampo('Renda mensal', `R$ ${formatarMoeda(ativo.rendaMensalEstimada)}`, 'valor-sensivel text-emerald-400')}
                    ${renderizarBlocoCampo('Posição atual', `R$ ${formatarMoeda(ativo.valorTotalAtual)}`, 'valor-sensivel')}
                    ${renderizarBlocoCampo('Resultado', `${ativo.lucroPrejuizoValor >= 0 ? '+' : '-'} R$ ${formatarMoeda(Math.abs(ativo.lucroPrejuizoValor))}`, `valor-sensivel ${classeResultado}`)}
                    ${renderizarBlocoCampo('Score', `${scoreAtivo.toFixed(1)} / 10`, 'text-cyan-300')}
                </div>

                <div class="cartao-ativo-mobile-acoes">
                    <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-editar-ativo">📝</button>
                    <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-excluir-ativo">✕</button>
                    <button data-ticker="${escaparHtml(ativo.ticker)}" type="button" class="botao-acao-tabela botao-registrar-provento">💸</button>
                    <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-alternar-favorito">${ativo.favorito ? '★' : '☆'}</button>
                    <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-alternar-watchlist">${ativo.emWatchlist ? '👁️' : '➕'}</button>
                    <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-alternar-comparador">${estaNoComparador ? '⇄' : '⊕'}</button>
                    <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-detalhes-ativo">${mapaLinhasExpandidas[ativo.id] ? '▴' : '▾'}</button>
                </div>

                ${
                    mapaLinhasExpandidas[ativo.id]
                        ? `
                            <div class="cartao-ativo-mobile-detalhes">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    ${renderizarBlocoCampo('Quantidade', String(ativo.quantidade))}
                                    ${renderizarBlocoCampo('Preço médio', `R$ ${formatarMoeda(ativo.precoMedio)}`, 'valor-sensivel')}
                                    ${renderizarBlocoCampo('Data com', ativo.diaDataCom == null ? '--' : String(ativo.diaDataCom))}
                                    ${renderizarBlocoCampo('Pagamento', ativo.diaPagamento == null ? '--' : String(ativo.diaPagamento))}
                                    ${renderizarBlocoCampo('Renda anual', `R$ ${formatarMoeda(ativo.rendaAnualEstimada)}`, 'valor-sensivel text-emerald-400')}
                                    ${renderizarBlocoCampo('Alocação real', `${(pesoReal * 100).toFixed(2)}%`)}
                                </div>

                                <div class="mt-3">
                                    <div class="cartao-ativo-mobile-rotulo">Observações</div>
                                    <div class="area-observacao-detalhes">${escaparHtml(ativo.observacao || 'Sem observações cadastradas.')}</div>
                                </div>
                            </div>
                        `
                        : ''
                }
            </div>
        `;
    }).join('');
}
