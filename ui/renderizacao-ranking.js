import { escaparHtml, formatarMoeda } from '../services/formatadores.js';

export function renderizarPainelRankingOportunidades(painelRankingOportunidades, listaRanking) {
    if (!listaRanking.length) {
        painelRankingOportunidades.innerHTML = '<div class="text-[11px] text-slate-500 italic">Sem ativos para ranquear.</div>';
        return;
    }

    painelRankingOportunidades.innerHTML = listaRanking.slice(0, 10).map((ativo, indice) => {
        return `
            <div class="cartao-ranking item-ranking">
                <div class="indice-ranking">${indice + 1}</div>

                <div>
                    <div class="font-black text-white">${escaparHtml(ativo.ticker)}</div>
                    <div class="text-[10px] uppercase text-slate-500 font-black mt-1">${escaparHtml(ativo.segmento)}</div>
                </div>

                <div class="text-right">
                    <div class="text-[11px] text-emerald-300 font-black">Score ${ativo.score.toFixed(1)}</div>
                    <div class="text-[10px] text-slate-500 valor-sensivel">R$ ${formatarMoeda(ativo.precoAtual)}</div>
                </div>
            </div>
        `;
    }).join('');
}