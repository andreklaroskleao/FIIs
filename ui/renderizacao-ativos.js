import { escaparHtml, formatarMoeda, obterClasseResultadoValor, formatarMesAno } from '../services/formatadores.js';
import { obterStatusAtivo, calcularScoreAtivo } from '../features/score-oportunidade.js';
import { montarResumoSimulacaoAporte } from '../features/simulador-aporte.js';

function obterListaProventosPorTicker(listaProventos, ticker) {
    return listaProventos
        .filter((provento) => provento.ticker === ticker)
        .sort((proventoA, proventoB) => proventoB.mesAno.localeCompare(proventoA.mesAno))
        .slice(0, 6);
}

function renderizarDetalhesDoAtivo(ativo, pesoReal, pesoIdeal, patrimonioTotalCarteira, listaProventos) {
    const listaProventosTicker = obterListaProventosPorTicker(listaProventos, ativo.ticker);
    const scoreAtivo = calcularScoreAtivo(ativo, pesoReal, pesoIdeal);
    const valorSimuladoAporte = ativo.valorSimulacaoAporte || 0;
    const resultadoSimulacao = montarResumoSimulacaoAporte(ativo, valorSimuladoAporte, patrimonioTotalCarteira);

    const rendaTotalCarteira = listaProventos.length >= 0
        ? 0
        : 0;

    const percentualParticipacaoNaRendaTotal = patrimonioTotalCarteira >= 0
        ? 0
        : rendaTotalCarteira;

    return `
        <tr class="linha-expandida">
            <td colspan="7" class="p-4 !pt-0">
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-2">
                    <div class="space-y-4">
                        <div class="cartao-detalhes-ativo">
                            <div class="titulo-cartao-detalhes">Resumo financeiro</div>
                            <div class="grid grid-cols-2 gap-3 text-[11px]">
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Custo total</div>
                                    <div class="valor-destaque-detalhes valor-sensivel">R$ ${formatarMoeda(ativo.valorTotalInvestido)}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Valor atual</div>
                                    <div class="valor-destaque-detalhes valor-sensivel">R$ ${formatarMoeda(ativo.valorTotalAtual)}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Resultado</div>
                                    <div class="valor-destaque-detalhes valor-sensivel ${obterClasseResultadoValor(ativo.lucroPrejuizoValor)}">${ativo.lucroPrejuizoValor >= 0 ? '+' : '-'} R$ ${formatarMoeda(Math.abs(ativo.lucroPrejuizoValor))}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Retorno</div>
                                    <div class="valor-destaque-detalhes ${obterClasseResultadoValor(ativo.lucroPrejuizoPercentual)}">${ativo.lucroPrejuizoPercentual >= 0 ? '+' : ''}${ativo.lucroPrejuizoPercentual.toFixed(2)}%</div>
                                </div>
                            </div>
                        </div>

                        <div class="cartao-detalhes-ativo">
                            <div class="titulo-cartao-detalhes">Valuation</div>
                            <div class="grid grid-cols-2 gap-3 text-[11px]">
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Preço médio</div>
                                    <div class="valor-destaque-detalhes valor-sensivel">R$ ${formatarMoeda(ativo.precoMedio)}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Preço teto</div>
                                    <div class="valor-destaque-detalhes valor-sensivel">R$ ${formatarMoeda(ativo.precoTeto)}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Diferença até teto</div>
                                    <div class="valor-destaque-detalhes ${obterClasseResultadoValor(ativo.diferencaParaPrecoTetoPercentual)}">${ativo.diferencaParaPrecoTetoPercentual >= 0 ? '+' : ''}${ativo.diferencaParaPrecoTetoPercentual.toFixed(2)}%</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Score</div>
                                    <div class="valor-destaque-detalhes text-blue-400">${scoreAtivo.toFixed(1)} / 10</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="cartao-detalhes-ativo">
                            <div class="titulo-cartao-detalhes">Renda e alocação</div>
                            <div class="grid grid-cols-2 gap-3 text-[11px] mb-4">
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Mensal estimada</div>
                                    <div class="valor-destaque-detalhes text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.rendaMensalEstimada)}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Anual estimada</div>
                                    <div class="valor-destaque-detalhes text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.rendaAnualEstimada)}</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Peso real</div>
                                    <div class="valor-destaque-detalhes text-blue-400">${(pesoReal * 100).toFixed(2)}%</div>
                                </div>
                                <div>
                                    <div class="text-slate-500 uppercase font-black mb-1">Peso alvo</div>
                                    <div class="valor-destaque-detalhes text-amber-400">${(pesoIdeal * 100).toFixed(2)}%</div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <div class="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                                    <span>Real</span>
                                    <span>Alvo</span>
                                </div>
                                <div class="barra-alocacao-container">
                                    <div class="barra-alocacao-real" style="width:${Math.min(100, Math.max(0, pesoReal * 100))}%"></div>
                                    <div class="marcador-alocacao-alvo" style="left:calc(${Math.min(100, Math.max(0, pesoIdeal * 100))}% - 1px)"></div>
                                </div>
                            </div>
                        </div>

                        <div class="cartao-detalhes-ativo">
                            <div class="titulo-cartao-detalhes">Simulador de aporte</div>
                            <div class="space-y-3">
                                <input
                                    type="number"
                                    class="campo-simulacao campo-simulacao-aporte"
                                    data-id="${escaparHtml(ativo.id)}"
                                    value="${valorSimuladoAporte || ''}"
                                    placeholder="Informe o valor do aporte"
                                >
                                ${
                                    resultadoSimulacao
                                        ? `
                                            <div class="grid grid-cols-2 gap-3 text-[11px]">
                                                <div>
                                                    <div class="text-slate-500 uppercase font-black mb-1">Cotas compráveis</div>
                                                    <div class="valor-destaque-detalhes">${resultadoSimulacao.quantidadeCompravel}</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-500 uppercase font-black mb-1">Novo peso</div>
                                                    <div class="valor-destaque-detalhes text-blue-400">${resultadoSimulacao.novoPeso.toFixed(2)}%</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-500 uppercase font-black mb-1">Nova posição</div>
                                                    <div class="valor-destaque-detalhes valor-sensivel">R$ ${formatarMoeda(resultadoSimulacao.novoValorPosicao)}</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-500 uppercase font-black mb-1">Aumento mensal</div>
                                                    <div class="valor-destaque-detalhes text-emerald-400 valor-sensivel">R$ ${formatarMoeda(resultadoSimulacao.aumentoRendaMensal)}</div>
                                                </div>
                                            </div>
                                        `
                                        : '<div class="text-[11px] text-slate-400">Digite um valor para simular o impacto do aporte.</div>'
                                }
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="cartao-detalhes-ativo">
                            <div class="titulo-cartao-detalhes">Últimos proventos do ticker</div>
                            ${
                                listaProventosTicker.length
                                    ? `
                                        <div class="space-y-2">
                                            ${listaProventosTicker.map((provento) => `
                                                <div class="flex items-center justify-between text-[11px] border-b border-white/5 pb-2">
                                                    <span class="text-slate-300">${formatarMesAno(provento.mesAno)}</span>
                                                    <span class="font-black text-emerald-400 valor-sensivel">R$ ${formatarMoeda(provento.valor)}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    `
                                    : '<div class="text-[11px] text-slate-400">Ainda não há proventos cadastrados para este ticker.</div>'
                            }
                        </div>

                        <div class="cartao-detalhes-ativo">
                            <div class="titulo-cartao-detalhes">Observações</div>
                            <div class="area-observacao-detalhes">${escaparHtml(ativo.observacao || 'Sem observações cadastradas.')}</div>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}

export function renderizarTabelaAtivos({
    corpoTabelaAtivos,
    listaAtivos,
    listaProventos,
    filtroSegmentoAtual,
    ordenacaoCarteiraAtual,
    caixaDisponivel,
    mapaLinhasExpandidas,
    obterListaAtivosFiltradaEOrdenada,
    calcularDistanciaCircularEntreDias,
    obterStatusAtivo
}) {
    const listaAtivosFiltradaEOrdenada = obterListaAtivosFiltradaEOrdenada(listaAtivos, filtroSegmentoAtual, ordenacaoCarteiraAtual);
    const diaAtual = new Date().getDate();

    let patrimonioTotal = 0;
    let somaDasNotas = 0;
    let valorTotalInvestidoCarteira = 0;
    let projecaoMensalTotal = 0;
    const listaSugestoesRebalanceamento = [];

    listaAtivosFiltradaEOrdenada.forEach((ativo) => {
        patrimonioTotal += ativo.valorTotalAtual;
        somaDasNotas += ativo.nota;
        valorTotalInvestidoCarteira += ativo.valorTotalInvestido;
        projecaoMensalTotal += ativo.rendaMensalEstimada;
    });

    const htmlLinhas = listaAtivosFiltradaEOrdenada.map((ativo) => {
        const pesoIdeal = somaDasNotas > 0 ? ativo.nota / somaDasNotas : 0;
        const pesoReal = patrimonioTotal > 0 ? ativo.valorTotalAtual / patrimonioTotal : 0;
        const larguraBarra = Math.max(0, Math.min(100, pesoReal * 100));
        const dataComProxima = ativo.diaDataCom ? calcularDistanciaCircularEntreDias(ativo.diaDataCom, diaAtual) <= 3 : false;
        const statusAtivo = obterStatusAtivo(ativo, pesoReal, pesoIdeal);

        if (pesoReal < pesoIdeal && ativo.precoAtual > 0 && ativo.precoAtual <= (ativo.precoTeto || Number.POSITIVE_INFINITY)) {
            const quantidadeSugerida = Math.floor((((patrimonioTotal + caixaDisponivel) * pesoIdeal) - ativo.valorTotalAtual) / ativo.precoAtual);
            if (quantidadeSugerida > 0) {
                listaSugestoesRebalanceamento.push({
                    ticker: ativo.ticker,
                    quantidadeSugerida,
                    nota: ativo.nota
                });
            }
        }

        const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);
        const classePrecoTeto = ativo.precoAtual > ativo.precoTeto ? 'text-red-500' : 'text-emerald-500';
        const htmlPrecoAtual = ativo.precoAtual > 0
            ? `R$ ${formatarMoeda(ativo.precoAtual)}`
            : '<span class="text-red-500 text-[10px]">API OFF</span>';

        const htmlLinhaPrincipal = `
            <tr>
                <td class="p-4">
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-black text-emerald-400 text-sm tracking-tighter">${escaparHtml(ativo.ticker)}</span>
                            <span class="selo-status ${statusAtivo.classe}">${statusAtivo.rotulo}</span>
                            ${dataComProxima ? '<span class="indicador-data-com">DATA COM</span>' : ''}
                        </div>
                        <span class="text-[9px] text-slate-500 uppercase font-black">${escaparHtml(ativo.segmento)}</span>
                        <span class="text-[9px] text-slate-400 uppercase font-black">Nota ${ativo.nota}</span>
                    </div>
                </td>

                <td class="p-4">
                    <div class="flex flex-col gap-2">
                        <div>
                            <div class="text-[8px] text-slate-500 font-bold uppercase">Atual</div>
                            <div class="font-bold text-white text-xs valor-sensivel">${htmlPrecoAtual}</div>
                        </div>
                        <div class="text-[10px] text-slate-400">
                            Médio: <span class="font-black valor-sensivel">R$ ${formatarMoeda(ativo.precoMedio)}</span>
                        </div>
                        <div class="text-[10px] ${classePrecoTeto} font-black">
                            Teto: R$ ${formatarMoeda(ativo.precoTeto)}
                        </div>
                        <div class="text-[10px] ${obterClasseResultadoValor(ativo.diferencaParaPrecoTetoPercentual)} font-black">
                            ${ativo.diferencaParaPrecoTetoPercentual >= 0 ? '+' : ''}${ativo.diferencaParaPrecoTetoPercentual.toFixed(2)}% até o teto
                        </div>
                    </div>
                </td>

                <td class="p-4 text-center">
                    <div class="flex flex-col items-center gap-2">
                        <div class="flex gap-2">
                            <div class="bg-slate-900 px-2 py-1 rounded border border-white/5 min-w-[42px]">
                                <span class="text-[7px] text-blue-400 font-black block text-center">COM</span>
                                <span class="text-white text-[10px] font-bold block text-center">${ativo.diaDataCom == null ? '--' : ativo.diaDataCom}</span>
                            </div>
                            <div class="bg-slate-900 px-2 py-1 rounded border border-white/5 min-w-[42px]">
                                <span class="text-[7px] text-emerald-400 font-black block text-center">PAGO</span>
                                <span class="text-white text-[10px] font-bold block text-center">${ativo.diaPagamento == null ? '--' : ativo.diaPagamento}</span>
                            </div>
                        </div>
                    </div>
                </td>

                <td class="p-4">
                    <div class="flex flex-col gap-2">
                        <div class="text-[10px] text-slate-400">
                            Mensal: <span class="font-black text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.rendaMensalEstimada)}</span>
                        </div>
                        <div class="text-[10px] text-slate-400">
                            Anual: <span class="font-black text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.rendaAnualEstimada)}</span>
                        </div>
                        <div class="text-[10px] text-slate-400">
                            Yield estimado: <span class="font-black text-purple-300">${ativo.precoAtual > 0 ? ((ativo.dividendoMensalEstimadoPorCota * 12 / ativo.precoAtual) * 100).toFixed(2) : '0.00'}%</span>
                        </div>
                    </div>
                </td>

                <td class="p-4">
                    <div class="flex flex-col gap-2">
                        <div class="text-[10px] text-slate-400">
                            Quantidade: <span class="font-black text-white">${formatarMoeda(ativo.quantidade, 0)}</span>
                        </div>
                        <div class="text-[10px] text-slate-400">
                            Custo: <span class="font-black valor-sensivel">R$ ${formatarMoeda(ativo.valorTotalInvestido)}</span>
                        </div>
                        <div class="text-[10px] text-slate-400">
                            Atual: <span class="font-black valor-sensivel">R$ ${formatarMoeda(ativo.valorTotalAtual)}</span>
                        </div>
                        <div class="text-[10px] ${classeResultado} font-black">
                            ${ativo.lucroPrejuizoValor >= 0 ? '+' : '-'} R$ ${formatarMoeda(Math.abs(ativo.lucroPrejuizoValor))} (${ativo.lucroPrejuizoPercentual >= 0 ? '+' : ''}${ativo.lucroPrejuizoPercentual.toFixed(2)}%)
                        </div>
                    </div>
                </td>

                <td class="p-4">
                    <div class="w-full min-w-[150px]">
                        <div class="flex justify-between text-[8px] font-black text-slate-500 mb-1 uppercase gap-3">
                            <span class="text-blue-400">${(pesoReal * 100).toFixed(1)}% real</span>
                            <span class="text-amber-400">${(pesoIdeal * 100).toFixed(1)}% alvo</span>
                        </div>
                        <div class="barra-alocacao-container">
                            <div class="barra-alocacao-real" style="width:${larguraBarra}%"></div>
                            <div class="marcador-alocacao-alvo" style="left:calc(${Math.min(100, Math.max(0, pesoIdeal * 100))}% - 1px)"></div>
                        </div>
                    </div>
                </td>

                <td class="p-4 text-center">
                    <div class="flex gap-2 justify-center flex-wrap">
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-editar-ativo hover:text-blue-400" aria-label="Editar ativo">📝</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-excluir-ativo hover:text-red-500" aria-label="Excluir ativo">✕</button>
                        <button data-ticker="${escaparHtml(ativo.ticker)}" type="button" class="botao-acao-tabela botao-registrar-provento hover:text-emerald-400" aria-label="Registrar provento">💸</button>
                        <button data-id="${escaparHtml(ativo.id)}" type="button" class="botao-acao-tabela botao-detalhes-ativo hover:text-purple-400" aria-label="Detalhes do ativo">${mapaLinhasExpandidas[ativo.id] ? '▴' : '▾'}</button>
                    </div>
                </td>
            </tr>
        `;

        const htmlLinhaDetalhes = mapaLinhasExpandidas[ativo.id]
            ? renderizarDetalhesDoAtivo(ativo, pesoReal, pesoIdeal, patrimonioTotal, listaProventos)
            : '';

        return htmlLinhaPrincipal + htmlLinhaDetalhes;
    }).join('');

    corpoTabelaAtivos.innerHTML = htmlLinhas || '<tr><td colspan="7" class="p-10 text-center text-slate-500 italic">Nenhum ativo corresponde aos filtros.</td></tr>';

    return {
        patrimonioTotal,
        valorTotalInvestidoCarteira,
        projecaoMensalTotal,
        listaSugestoesRebalanceamento
    };
}
