import { escaparHtml, formatarMoeda } from '../services/formatadores.js';

function agruparAportesPorTicker(listaAportes) {
    const mapaAportes = {};

    listaAportes.forEach((aporte) => {
        if (!mapaAportes[aporte.ticker]) {
            mapaAportes[aporte.ticker] = [];
        }

        mapaAportes[aporte.ticker].push(aporte);
    });

    Object.keys(mapaAportes).forEach((ticker) => {
        mapaAportes[ticker].sort((aporteA, aporteB) => {
            const dataA = aporteA.dataAporte || '';
            const dataB = aporteB.dataAporte || '';
            return dataB.localeCompare(dataA);
        });
    });

    return mapaAportes;
}

function calcularResumoDoHistorico(listaAportesTicker) {
    let quantidadeTotalComprada = 0;
    let valorTotalInvestido = 0;

    listaAportesTicker.forEach((aporte) => {
        quantidadeTotalComprada += Number(aporte.quantidadeComprada || 0);
        valorTotalInvestido += Number(aporte.valorTotalAporte || 0);
    });

    const precoMedioCalculado = quantidadeTotalComprada > 0
        ? valorTotalInvestido / quantidadeTotalComprada
        : 0;

    return {
        quantidadeTotalComprada,
        valorTotalInvestido,
        precoMedioCalculado,
        quantidadeDeAportes: listaAportesTicker.length
    };
}

export function renderizarPainelHistoricoAportes(painelHistoricoAportes, listaAportes) {
    if (!listaAportes.length) {
        painelHistoricoAportes.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum aporte registrado.</div>';
        return;
    }

    const mapaAportesPorTicker = agruparAportesPorTicker(listaAportes);
    const listaTickers = Object.keys(mapaAportesPorTicker).sort((tickerA, tickerB) => tickerA.localeCompare(tickerB));

    painelHistoricoAportes.innerHTML = listaTickers.map((ticker) => {
        const listaAportesTicker = mapaAportesPorTicker[ticker];
        const resumo = calcularResumoDoHistorico(listaAportesTicker);

        return `
            <div class="cartao-aporte">
                <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-black text-amber-300 text-sm">${escaparHtml(ticker)}</span>
                        <span class="selo-status aporte">Aportes</span>
                    </div>

                    <div class="text-[10px] uppercase font-black text-slate-500">
                        ${resumo.quantidadeDeAportes} registro(s)
                    </div>
                </div>

                <div class="grade-resumo-aporte">
                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Quantidade comprada</div>
                        <div class="valor-resumo-aporte">${resumo.quantidadeTotalComprada}</div>
                    </div>
                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Valor investido</div>
                        <div class="valor-resumo-aporte valor-sensivel">R$ ${formatarMoeda(resumo.valorTotalInvestido)}</div>
                    </div>
                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Preço médio calculado</div>
                        <div class="valor-resumo-aporte valor-sensivel">R$ ${formatarMoeda(resumo.precoMedioCalculado)}</div>
                    </div>
                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Último aporte</div>
                        <div class="valor-resumo-aporte">${escaparHtml(listaAportesTicker[0]?.dataAporte || '--')}</div>
                    </div>
                </div>

                <div class="mt-4 space-y-3">
                    ${listaAportesTicker.map((aporte) => {
                        return `
                            <div class="bg-slate-950/50 rounded-xl border border-white/5 p-3">
                                <div class="flex items-center justify-between gap-3 flex-wrap">
                                    <div class="text-[11px] text-slate-300">
                                        <span class="font-black">${aporte.quantidadeComprada}</span> cota(s) a
                                        <span class="font-black valor-sensivel">R$ ${formatarMoeda(aporte.precoPorCota)}</span>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <button data-id="${escaparHtml(aporte.id)}" type="button" class="botao-acao-tabela botao-editar-aporte">📝</button>
                                        <button data-id="${escaparHtml(aporte.id)}" type="button" class="botao-acao-tabela botao-excluir-aporte">✕</button>
                                    </div>
                                </div>

                                <div class="mt-2 text-[11px] text-slate-400">
                                    Data: <span class="text-slate-200">${escaparHtml(aporte.dataAporte || '--')}</span>
                                </div>

                                <div class="mt-1 text-[11px] text-slate-400">
                                    Valor total: <span class="text-white font-black valor-sensivel">R$ ${formatarMoeda(aporte.valorTotalAporte)}</span>
                                </div>

                                <div class="mt-2 area-observacao-aporte">${escaparHtml(aporte.observacao || 'Sem observação registrada.')}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}