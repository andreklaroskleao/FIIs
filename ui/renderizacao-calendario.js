import { escaparHtml } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function obterClasseTipoEvento(tipoEvento) {
    if (tipoEvento === 'Data com') {
        return 'calendario-com';
    }

    return 'calendario-pagamento';
}

export function renderizarPainelCalendarioCarteira(painelCalendarioCarteira, listaEventosCalendario) {
    if (!painelCalendarioCarteira) {
        return;
    }

    if (!Array.isArray(listaEventosCalendario) || listaEventosCalendario.length === 0) {
        painelCalendarioCarteira.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Nenhum evento disponível.</div>
        `;
        return;
    }

    painelCalendarioCarteira.innerHTML = listaEventosCalendario.slice(0, 12).map((evento) => {
        return `
            <div class="cartao-calendario">
                <div class="item-calendario">
                    <div>
                        <div class="font-black text-sky-400">${escaparHtml(evento.ticker || '--')}</div>
                        <div class="text-[10px] text-slate-500 uppercase font-black">${escaparHtml(evento.segmento || 'Outros')}</div>
                    </div>

                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 uppercase font-black">Dia</div>
                        <div class="font-black">${converterParaNumeroSeguro(evento.dia, 0)}</div>
                    </div>

                    <div class="text-right">
                        <span class="selo-status ${obterClasseTipoEvento(evento.tipo)}">${escaparHtml(evento.tipo || '--')}</span>
                        <div class="text-[10px] text-slate-500 uppercase font-black mt-1">
                            Em ${converterParaNumeroSeguro(evento.distanciaDias, 0)} dia(s)
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}