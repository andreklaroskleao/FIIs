import { escaparHtml, formatarMesAno, formatarMoeda } from '../services/formatadores.js';

export function renderizarHistoricoProventos(corpoTabelaProventos, listaProventos) {
    const listaProventosOrdenada = [...listaProventos].sort((proventoA, proventoB) => {
        if (proventoA.mesAno === proventoB.mesAno) {
            return proventoA.ticker.localeCompare(proventoB.ticker);
        }
        return proventoB.mesAno.localeCompare(proventoA.mesAno);
    });

    if (!listaProventosOrdenada.length) {
        corpoTabelaProventos.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-500 italic">Nenhum provento registrado.</td></tr>';
        return;
    }

    corpoTabelaProventos.innerHTML = listaProventosOrdenada.map((provento) => {
        return `
            <tr>
                <td class="p-4 font-black text-emerald-400">${escaparHtml(provento.ticker)}</td>
                <td class="p-4 text-slate-300">${escaparHtml(formatarMesAno(provento.mesAno))}</td>
                <td class="p-4 text-right fonte-monoespacada valor-sensivel">R$ ${formatarMoeda(provento.valor)}</td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                        <button type="button" class="botao-acao-tabela botao-editar-provento hover:text-blue-400" data-id="${escaparHtml(provento.id)}" aria-label="Editar provento">📝</button>
                        <button type="button" class="botao-acao-tabela botao-excluir-provento hover:text-red-400" data-id="${escaparHtml(provento.id)}" aria-label="Excluir provento">✕</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}
