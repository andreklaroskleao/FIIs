import { escaparHtml, formatarMoeda, formatarPercentual } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

export function renderizarPainelRankingOportunidades(painelRankingOportunidades, listaRanking) {
    if (!painelRankingOportunidades) {
        return;
    }

    if (!Array.isArray(listaRanking) || listaRanking.length === 0) {
        painelRankingOportunidades.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Sem ativos para ranquear.</div>
        `;
        return;
    }

    painelRankingOportunidades.innerHTML = listaRanking.slice(0, 10).map((itemRanking) => {
        return `
            <div class="cartao-ranking">
                <div class="item-ranking">
                    <div class="indice-ranking">#${converterParaNumeroSeguro(itemRanking.posicaoRanking, 0)}</div>

                    <div>
                        <div class="font-black text-emerald-400">${escaparHtml(itemRanking.ticker)}</div>
                        <div class="text-[11px] text-slate-400">
                            Score: <strong>${formatarMoeda(converterParaNumeroSeguro(itemRanking.score, 0))}</strong>
                        </div>
                    </div>

                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 uppercase font-black">Desconto</div>
                        <div class="font-black">${formatarPercentual(converterParaNumeroSeguro(itemRanking.descontoPercentual, 0))}</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Preço atual</div>
                        <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(itemRanking.precoAtual, 0))}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Preço teto</div>
                        <div class="cartao-ativo-mobile-valor">R$ ${formatarMoeda(converterParaNumeroSeguro(itemRanking.precoTeto, 0))}</div>
                    </div>

                    <div class="cartao-ativo-mobile-campo">
                        <div class="cartao-ativo-mobile-rotulo">Defasagem de alocação</div>
                        <div class="cartao-ativo-mobile-valor">${formatarPercentual(converterParaNumeroSeguro(itemRanking.defasagemAlocacao, 0))}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}