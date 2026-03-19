import { escaparHtml } from '../services/formatadores.js';

export function renderizarPainelCalendarioCarteira(painelCalendarioCarteira, listaEventos) {
    if (!listaEventos.length) {
        painelCalendarioCarteira.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum evento disponível.</div>';
        return;
    }

    painelCalendarioCarteira.innerHTML = listaEventos.slice(0, 12).map((eventoCalendario) => {
        const classeSelo = eventoCalendario.tipo === 'Data com'
            ? 'calendario-com'
            : 'calendario-pagamento';

        return `
            <div class="cartao-calendario item-calendario">
                <div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-black text-sky-300">${escaparHtml(eventoCalendario.ticker)}</span>
                        <span class="selo-status ${classeSelo}">${escaparHtml(eventoCalendario.tipo)}</span>
                    </div>
                    <div class="text-[11px] text-slate-400 mt-1">
                        ${escaparHtml(eventoCalendario.segmento)}
                    </div>
                </div>

                <div class="text-left md:text-right">
                    <div class="text-[11px] text-slate-400">Dia</div>
                    <div class="font-black text-white">${eventoCalendario.dia}</div>
                </div>

                <div class="text-left md:text-right">
                    <div class="text-[11px] text-slate-400">Em</div>
                    <div class="font-black text-emerald-400">${eventoCalendario.distanciaDias} dia(s)</div>
                </div>
            </div>
        `;
    }).join('');
}