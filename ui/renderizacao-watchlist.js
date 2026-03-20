import { escaparHtml, formatarMoeda } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

export function renderizarPainelWatchlist(painelWatchlist, listaAtivos, mapaObservacoesWatchlist = {}) {
    if (!painelWatchlist) {
        return;
    }

    const listaWatchlist = (listaAtivos || []).filter((ativo) => ativo.emWatchlist);

    if (listaWatchlist.length === 0) {
        painelWatchlist.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Nenhum ativo em watchlist.</div>
        `;
        return;
    }

    painelWatchlist.innerHTML = listaWatchlist.map((ativo) => {
        const observacaoWatchlist = mapaObservacoesWatchlist?.[ativo.id] || '';

        return `
            <div class="cartao-watchlist">
                <div class="flex items-center justify-between gap-3 mb-3">
                    <div>
                        <div class="font-black text-pink-400">${escaparHtml(ativo.ticker)}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-black">${escaparHtml(ativo.segmento || 'Outros')}</div>
                    </div>

                    <span class="selo-status watchlist">Watchlist</span>
                </div>

                <div class="space-y-2 mb-4">
                    <div class="text-[11px] text-slate-300">
                        Preço atual: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtual, 0))}</strong>
                    </div>

                    <div class="text-[11px] text-slate-300">
                        Preço teto: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoTeto, 0))}</strong>
                    </div>

                    <div class="text-[11px] text-slate-300">
                        Nota: <strong>${converterParaNumeroSeguro(ativo.nota, 0)}</strong>
                    </div>
                </div>

                <div class="mb-2">
                    <div class="titulo-cartao-detalhes">Observação da watchlist</div>
                    <textarea
                        class="textarea-watchlist campo-observacao-watchlist"
                        data-id="${escaparHtml(ativo.id)}"
                        placeholder="Escreva observações para acompanhar este ativo..."
                    >${escaparHtml(observacaoWatchlist)}</textarea>
                </div>
            </div>
        `;
    }).join('');
}