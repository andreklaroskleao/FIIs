import { escaparHtml } from '../services/formatadores.js';

function obterClasseVisualAlerta(tipo) {
    if (tipo === 'acima-do-teto') {
        return 'alerta-vermelho';
    }

    if (tipo === 'watchlist') {
        return 'alerta-rosa';
    }

    return 'alerta-azul';
}

export function renderizarPainelAlertas(painelAlertas, listaAlertas) {
    if (!painelAlertas) {
        return;
    }

    if (!Array.isArray(listaAlertas) || listaAlertas.length === 0) {
        painelAlertas.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Nenhum alerta no momento.</div>
        `;
        return;
    }

    painelAlertas.innerHTML = listaAlertas.map((alerta) => {
        return `
            <div class="cartao-alerta ${obterClasseVisualAlerta(alerta.tipo)}">
                <div class="flex items-center justify-between gap-3 mb-2">
                    <div class="font-black text-slate-100">${escaparHtml(alerta.titulo || 'Alerta')}</div>
                    <span class="selo-status neutro">${escaparHtml(alerta.ticker || '--')}</span>
                </div>

                <div class="text-[11px] text-slate-300">
                    ${escaparHtml(alerta.descricao || 'Sem descrição.')}
                </div>
            </div>
        `;
    }).join('');
}