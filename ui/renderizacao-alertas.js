import { escaparHtml, formatarMoeda } from '../services/formatadores.js';

export function renderizarPainelAlertas(painelAlertas, listaAlertas) {
    if (!listaAlertas.length) {
        painelAlertas.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum alerta no momento.</div>';
        return;
    }

    painelAlertas.innerHTML = listaAlertas.map((alerta) => {
        return `
            <div class="cartao-alerta ${escaparHtml(alerta.classeCartao)}">
                <div class="flex items-center justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-black text-white">${escaparHtml(alerta.ticker)}</span>
                        <span class="selo-status ${escaparHtml(alerta.classeSelo)}">${escaparHtml(alerta.tipo)}</span>
                    </div>
                </div>

                <div class="text-[11px] text-slate-300 leading-relaxed">
                    ${escaparHtml(alerta.mensagem)}
                </div>

                <div class="mt-3 text-[10px] text-slate-500">
                    Preço atual: <span class="text-white font-black valor-sensivel">R$ ${formatarMoeda(alerta.precoAtual)}</span>
                </div>
            </div>
        `;
    }).join('');
}