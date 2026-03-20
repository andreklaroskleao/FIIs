import { escaparHtml, formatarMoeda } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

export function renderizarPainelFavoritos(painelFavoritos, listaAtivos) {
    if (!painelFavoritos) {
        return;
    }

    const listaFavoritos = (listaAtivos || []).filter((ativo) => ativo.favorito);

    if (listaFavoritos.length === 0) {
        painelFavoritos.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Nenhum ativo favorito.</div>
        `;
        return;
    }

    painelFavoritos.innerHTML = listaFavoritos.map((ativo) => {
        return `
            <div class="cartao-favorito">
                <div class="flex items-center justify-between gap-3 mb-3">
                    <div>
                        <div class="font-black text-yellow-400">${escaparHtml(ativo.ticker)}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-black">${escaparHtml(ativo.segmento || 'Outros')}</div>
                    </div>

                    <span class="selo-status favorito">Favorito</span>
                </div>

                <div class="space-y-2">
                    <div class="text-[11px] text-slate-300">
                        Nota: <strong>${converterParaNumeroSeguro(ativo.nota, 0)}</strong>
                    </div>

                    <div class="text-[11px] text-slate-300">
                        Preço atual: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtual, 0))}</strong>
                    </div>

                    <div class="text-[11px] text-slate-300">
                        Patrimônio: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.valorTotalAtual, 0))}</strong>
                    </div>

                    <div class="text-[11px] text-slate-300">
                        Renda mensal: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0))}</strong>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}