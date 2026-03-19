import { escaparHtml, formatarMoeda } from '../services/formatadores.js';

export function renderizarPainelFavoritos(painelFavoritos, listaAtivos) {
    const listaFavoritos = listaAtivos.filter((ativo) => ativo.favorito);

    if (!listaFavoritos.length) {
        painelFavoritos.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum ativo favorito.</div>';
        return;
    }

    painelFavoritos.innerHTML = listaFavoritos.map((ativo) => {
        return `
            <div class="cartao-favorito">
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <div class="font-black text-yellow-300">${escaparHtml(ativo.ticker)}</div>
                        <div class="text-[10px] uppercase text-slate-500 font-black mt-1">${escaparHtml(ativo.segmento)}</div>
                    </div>
                    <span class="selo-status favorito">Favorito</span>
                </div>

                <div class="mt-3 text-[11px] text-slate-400">
                    Posição: <span class="font-black text-white valor-sensivel">R$ ${formatarMoeda(ativo.valorTotalAtual)}</span>
                </div>

                <div class="mt-1 text-[11px] text-slate-400">
                    Renda mensal: <span class="font-black text-emerald-400 valor-sensivel">R$ ${formatarMoeda(ativo.rendaMensalEstimada)}</span>
                </div>
            </div>
        `;
    }).join('');
}