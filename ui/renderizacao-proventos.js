import { escaparHtml, formatarMoeda, formatarMesAno } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function ordenarListaProventosDoMaisRecenteParaOMaisAntigo(listaProventos) {
    return [...(listaProventos || [])].sort((proventoA, proventoB) => {
        const mesA = String(proventoA.mesAno || '');
        const mesB = String(proventoB.mesAno || '');
        return mesB.localeCompare(mesA);
    });
}

export function renderizarHistoricoProventos(corpoTabelaProventos, listaProventos) {
    const listaOrdenada = ordenarListaProventosDoMaisRecenteParaOMaisAntigo(listaProventos);

    if (!Array.isArray(listaOrdenada) || listaOrdenada.length === 0) {
        corpoTabelaProventos.innerHTML = `
            <tr>
                <td colspan="4" class="p-8 text-center text-slate-500 italic">
                    Nenhum provento registrado.
                </td>
            </tr>
        `;
        return;
    }

    corpoTabelaProventos.innerHTML = listaOrdenada.map((provento) => {
        const valor = converterParaNumeroSeguro(provento.valor, 0);

        return `
            <tr>
                <td class="font-black text-emerald-400">${escaparHtml(provento.ticker || '--')}</td>
                <td>${escaparHtml(formatarMesAno(provento.mesAno || ''))}</td>
                <td class="text-right font-black">R$ ${formatarMoeda(valor)}</td>
                <td class="text-center">
                    <div class="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            class="botao-acao-tabela botao-editar-provento"
                            data-id="${escaparHtml(provento.id || '')}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-acao-tabela botao-excluir-provento"
                            data-id="${escaparHtml(provento.id || '')}"
                        >
                            Excluir
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}