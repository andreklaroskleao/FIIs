import { escaparHtml, formatarMoeda, formatarPercentual } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

export function renderizarPainelSimuladorGlobal(painelSimuladorGlobal, resultadoSimulacaoGlobal) {
    if (!painelSimuladorGlobal) {
        return;
    }

    const valorTotalAporte = converterParaNumeroSeguro(resultadoSimulacaoGlobal?.valorTotalAporte, 0);
    const listaSugestoes = Array.isArray(resultadoSimulacaoGlobal?.listaSugestoes)
        ? resultadoSimulacaoGlobal.listaSugestoes
        : [];

    if (valorTotalAporte <= 0 || listaSugestoes.length === 0) {
        painelSimuladorGlobal.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Informe um valor para simular a distribuição do aporte.</div>
        `;
        return;
    }

    painelSimuladorGlobal.innerHTML = `
        <div class="cartao-simulador-global">
            <div class="text-[11px] text-slate-300 mb-4">
                Valor total do aporte: <strong>R$ ${formatarMoeda(valorTotalAporte)}</strong>
            </div>

            <div class="space-y-3">
                ${listaSugestoes.map((sugestao) => {
                    return `
                        <div class="item-simulador-global">
                            <div>
                                <div class="font-black text-cyan-400">${escaparHtml(sugestao.ticker)}</div>
                                <div class="text-[10px] text-slate-500 uppercase font-black">
                                    ${formatarPercentual(converterParaNumeroSeguro(sugestao.percentualDistribuicao, 0) * 100)}
                                </div>
                            </div>

                            <div class="text-right">
                                <div class="text-[10px] text-slate-500 uppercase font-black">Valor sugerido</div>
                                <div class="font-black">R$ ${formatarMoeda(converterParaNumeroSeguro(sugestao.valorSugerido, 0))}</div>
                            </div>

                            <div class="text-right">
                                <div class="text-[10px] text-slate-500 uppercase font-black">Quantidade</div>
                                <div class="font-black">${converterParaNumeroSeguro(sugestao.quantidadeSugerida, 0)}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}