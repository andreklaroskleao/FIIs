import { escaparHtml, formatarMoeda } from '../services/formatadores.js';

export function renderizarPainelSimuladorGlobal(painelSimuladorGlobal, resultadoSimulacaoGlobal) {
    if (!resultadoSimulacaoGlobal || !resultadoSimulacaoGlobal.listaDistribuicao.length) {
        painelSimuladorGlobal.innerHTML = '<div class="text-[11px] text-slate-500 italic">Informe um valor para simular a distribuição do aporte.</div>';
        return;
    }

    painelSimuladorGlobal.innerHTML = `
        <div class="grid grid-cols-1 gap-3">
            ${resultadoSimulacaoGlobal.listaDistribuicao.map((itemDistribuicao) => {
                return `
                    <div class="cartao-simulador-global item-simulador-global">
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-black text-cyan-300">${escaparHtml(itemDistribuicao.ticker)}</span>
                                <span class="selo-status ranking">Score ${itemDistribuicao.score.toFixed(1)}</span>
                            </div>
                            <div class="text-[11px] text-slate-400 mt-1">
                                ${escaparHtml(itemDistribuicao.segmento)}
                            </div>
                        </div>

                        <div class="text-left md:text-right">
                            <div class="text-[11px] text-slate-400">Aporte sugerido</div>
                            <div class="font-black text-white valor-sensivel">R$ ${formatarMoeda(itemDistribuicao.valorSugerido)}</div>
                        </div>

                        <div class="text-left md:text-right">
                            <div class="text-[11px] text-slate-400">Cotas estimadas</div>
                            <div class="font-black text-emerald-400">${itemDistribuicao.quantidadeEstimativa}</div>
                        </div>
                    </div>
                `;
            }).join('')}

            <div class="cartao-simulador-global">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div class="text-[11px] text-slate-400">Valor do aporte</div>
                        <div class="font-black text-white valor-sensivel">R$ ${formatarMoeda(resultadoSimulacaoGlobal.valorTotalAporte)}</div>
                    </div>
                    <div>
                        <div class="text-[11px] text-slate-400">Valor distribuído</div>
                        <div class="font-black text-cyan-300 valor-sensivel">R$ ${formatarMoeda(resultadoSimulacaoGlobal.valorDistribuido)}</div>
                    </div>
                    <div>
                        <div class="text-[11px] text-slate-400">Saldo residual</div>
                        <div class="font-black text-amber-300 valor-sensivel">R$ ${formatarMoeda(resultadoSimulacaoGlobal.saldoResidual)}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}