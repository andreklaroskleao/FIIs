import { escaparHtml, formatarMoeda } from '../services/formatadores.js';

export function renderizarPainelWatchlist(painelWatchlist, listaAtivos) {
    const listaWatchlist = listaAtivos.filter((ativo) => ativo.emWatchlist);

    if (!listaWatchlist.length) {
        painelWatchlist.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum ativo em watchlist.</div>';
        return;
    }

    painelWatchlist.innerHTML = listaWatchlist.map((ativo) => {
        return `
            <div class="cartao-watchlist">
                <div class="flex items-center justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-black text-pink-400 text-sm">${escaparHtml(ativo.ticker)}</span>
                        ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                        <span class="selo-status watchlist">Watchlist</span>
                    </div>
                    <span class="text-[10px] uppercase font-black text-slate-500">${escaparHtml(ativo.segmento)}</span>
                </div>

                <div class="space-y-1 text-[11px]">
                    <div class="text-slate-400">
                        Preço atual: <span class="font-black text-white valor-sensivel">R$ ${formatarMoeda(ativo.precoAtual)}</span>
                    </div>
                    <div class="text-slate-400">
                        Preço teto: <span class="font-black text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.precoTeto)}</span>
                    </div>
                    <div class="text-slate-400">
                        Nota: <span class="font-black text-blue-300">${ativo.nota}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
