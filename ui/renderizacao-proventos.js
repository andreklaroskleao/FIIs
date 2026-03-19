import { escaparHtml, formatarMesAno, formatarMoeda } from '../services/formatadores.js';

export function renderizarHistoricoProventos(corpoTabelaProventos, listaProventos) {
    if (!listaProventos.length) {
        corpoTabelaProventos.innerHTML = `
            <tr>
                <td colspan="4" class="p-8 text-center text-slate-500 italic">
                    Nenhum provento registrado.
                </td>
            </tr>
        `;
        return;
    }

    const listaOrdenada = [...listaProventos].sort((a, b) => {
        return (b.mesAno || '').localeCompare(a.mesAno || '');
    });

    corpoTabelaProventos.innerHTML = listaOrdenada.map((provento) => {
        return `
            <tr>
                <td class="p-4 font-black">${escaparHtml(provento.ticker)}</td>
                <td class="p-4">${escaparHtml(formatarMesAno(provento.mesAno))}</td>
                <td class="p-4 text-right valor-sensivel">R$ ${formatarMoeda(provento.valor)}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button data-id="${escaparHtml(provento.id)}" type="button" class="botao-acao-tabela botao-editar-provento">📝</button>
                        <button data-id="${escaparHtml(provento.id)}" type="button" class="botao-acao-tabela botao-excluir-provento">✕</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}