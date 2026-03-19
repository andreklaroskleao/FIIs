import {
    escaparHtml,
    formatarMoeda,
    formatarPercentual,
    obterClasseResultadoValor
} from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';
import { calcularScoreAtivo } from '../features/score-oportunidade.js';

function gerarLinhaExpandida(ativo, pesoReal, pesoIdeal, scoreAtivo) {
    const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);

    return `
        <tr class="linha-expandida">
            <td colspan="7">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-2">
                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Quantidade</div>
                        <div class="valor-destaque-detalhes">${ativo.quantidade}</div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Preço médio</div>
                        <div class="valor-destaque-detalhes valor-sensivel">R$ ${formatarMoeda(ativo.precoMedio)}</div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Lucro / prejuízo</div>
                        <div class="valor-destaque-detalhes ${classeResultado} valor-sensivel">
                            ${ativo.lucroPrejuizoValor >= 0 ? '+' : '-'} R$ ${formatarMoeda(Math.abs(ativo.lucroPrejuizoValor))}
                        </div>
                        <div class="texto-meta-secundario ${classeResultado}">
                            ${formatarPercentual(ativo.lucroPrejuizoPercentual)}
                        </div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Score</div>
                        <div class="valor-destaque-detalhes text-cyan-300">${scoreAtivo.toFixed(1)} / 10</div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Origem do cálculo</div>
                        <div class="valor-destaque-detalhes">${escaparHtml(ativo.origemCalculoPosicao === 'aportes' ? 'Aportes' : 'Cadastro')}</div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Data com</div>
                        <div class="valor-destaque-detalhes">${ativo.diaDataCom ?? '--'}</div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Pagamento</div>
                        <div class="valor-destaque-detalhes">${ativo.diaPagamento ?? '--'}</div>
                    </div>

                    <div class="cartao-detalhes-ativo">
                        <div class="titulo-cartao-detalhes">Alocação atual</div>
                        <div class="valor-destaque-detalhes">${formatarPercentual(pesoReal * 100)}</div>
                        <div class="texto-meta-secundario">Ideal: ${formatarPercentual(pesoIdeal * 100)}</div>
                    </div>
                </div>

                <div class="mt-4 px-2">
                    <div class="titulo-cartao-detalhes">Observações</div>
                    <div class="area-observacao-detalhes">${escaparHtml(ativo.observacao || 'Sem observações cadastradas.')}</div>
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
    const listaFiltradaOrdenada = obterListaAtivosFiltradaEOrdenada(
        listaAtivos,
        filtroSegmentoAtual,
        ordenacaoCarteiraAtual
    );

    const patrimonioTotal = listaAtivos.reduce((soma, ativo) => soma + Number(ativo.valorTotalAtual || 0), 0);
    const projecaoMensalTotal = listaAtivos.reduce((soma, ativo) => soma + Number(ativo.rendaMensalEstimada || 0), 0);
    const valorTotalInvestidoCarteira = listaAtivos.reduce((soma, ativo) => soma + Number(ativo.valorTotalInvestido || 0), 0);
    const somaDasNotas = listaAtivos.reduce((soma, ativo) => soma + Number(ativo.nota || 0), 0);

    const listaSugestoesRebalanceamento = [];

    if (!listaFiltradaOrdenada.length) {
        corpoTabelaAtivos.innerHTML = `
            <tr>
                <td colspan="7" class="p-10 text-center text-slate-500 italic">
                    Nenhum ativo corresponde aos filtros.
                </td>
            </tr>
        `;

        return {
            patrimonioTotal,
            projecaoMensalTotal,
            valorTotalInvestidoCarteira,
            listaSugestoesRebalanceamento
        };
    }

    let htmlTabela = '';

    listaFiltradaOrdenada.forEach((ativo) => {
        const pesoReal = patrimonioTotal > 0 ? ativo.valorTotalAtual / patrimonioTotal : 0;
        const pesoIdeal = somaDasNotas > 0 ? ativo.nota / somaDasNotas : 0;
        const scoreAtivo = calcularScoreAtivo(ativo, pesoReal, pesoIdeal, caixaDisponivel);
        const statusAtivo = obterStatusAtivo(ativo, pesoReal, pesoIdeal);

        const quantidadeSugerida = ativo.precoAtual > 0
            ? Math.floor(Math.max(0, caixaDisponivel * Math.max(0, pesoIdeal - pesoReal)) / ativo.precoAtual)
            : 0;

        if (quantidadeSugerida > 0) {
            listaSugestoesRebalanceamento.push({
                ticker: ativo.ticker,
                quantidadeSugerida,
                nota: ativo.nota
            });
        }

        const estaNoComparador = listaAtivosSelecionadosParaComparacao.includes(ativo.id);
        const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);

        htmlTabela += `
            <tr>
                <td class="p-6">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-black text-emerald-400">${escaparHtml(ativo.ticker)}</span>
                            <span class="selo-status ${statusAtivo.classe}">${escaparHtml(statusAtivo.rotulo)}</span>
                            ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                            ${ativo.emWatchlist ? '<span class="selo-status watchlist">Watchlist</span>' : ''}
                        </div>
                        <span class="text-[10px] uppercase text-slate-500 font-black">${escaparHtml(ativo.segmento)}</span>
                    </div>
                </td>

                <td class="p-6">
                    <div class="space-y-1">
                        <div class="text-[11px] text-slate-400">Preço atual</div>
                        <div class="font-black valor-sensivel">
                            ${ativo.precoAtual > 0 ? `R$ ${formatarMoeda(ativo.precoAtual)}` : 'API OFF'}
                        </div>
                        <div class="text-[10px] text-slate-500">Teto: R$ ${formatarMoeda(ativo.precoTeto)}</div>
                    </div>
                </td>

                <td class="p-6">
                    <div class="space-y-1">
                        <div class="text-[11px] text-slate-400">Data com</div>
                        <div class="font-black">${ativo.diaDataCom ?? '--'}</div>
                        <div class="text-[10px] text-slate-500">Pagamento: ${ativo.diaPagamento ?? '--'}</div>
                    </div>
                </td>

                <td class="p-6">
                    <div class="space-y-1">
                        <div class="text-[11px] text-slate-400">Mensal</div>
                        <div class="font-black text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.rendaMensalEstimada)}</div>
                        <div class="text-[10px] text-slate-500">Anual: R$ ${formatarMoeda(ativo.rendaAnualEstimada)}</div>
                    </div>
                </td>

                <td class="p-6">
                    <div class="space-y-1">
                        <div class="font-black valor-sensivel">R$ ${formatarMoeda(ativo.valorTotalAtual)}</div>
                        <div class="text-[10px] ${classeResultado}">${formatarPercentual(ativo.lucroPrejuizoPercentual)}</div>
                    </div>
                </td>

                <td class="p-6">
                    <div class="space-y-2">
                        <div class="text-[10px] text-slate-400">Real ${formatarPercentual(pesoReal * 100)}</div>
                        <div class="barra-alocacao-container">
                            <div class="barra-alocacao-real" style="width: ${Math.min(100, pesoReal * 100)}%"></div>
                            <div class="marcador-alocacao-alvo" style="left: ${Math.min(100, pesoIdeal * 100)}%"></div>
                        </div>
                        <div class="text-[10px] text-slate-500">Ideal ${formatarPercentual(pesoIdeal * 100)}</div>
                    </div>
                </td>

                <td class="p-6">
                    <div class="flex items-center justify-center gap-2 flex-wrap">
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-editar-ativo">📝</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-excluir-ativo">✕</button>
                        <button data-ticker="${escaparHtml(ativo.ticker)}" type="button" class="botao-acao-tabela botao-registrar-provento">💸</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-alternar-favorito">${ativo.favorito ? '★' : '☆'}</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-alternar-watchlist">${ativo.emWatchlist ? '👁️' : '➕'}</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-alternar-comparador">${estaNoComparador ? '⇄' : '⊕'}</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-detalhes-ativo">${mapaLinhasExpandidas[ativo.id] ? '▴' : '▾'}</button>
                    </div>
                </td>
            </tr>
        `;

        if (mapaLinhasExpandidas[ativo.id]) {
            htmlTabela += gerarLinhaExpandida(ativo, pesoReal, pesoIdeal, scoreAtivo);
        }
    });

    corpoTabelaAtivos.innerHTML = htmlTabela;

    return {
        patrimonioTotal,
        projecaoMensalTotal,
        valorTotalInvestidoCarteira,
        listaSugestoesRebalanceamento
    };
}