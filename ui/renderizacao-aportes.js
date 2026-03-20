import { escaparHtml, formatarMoeda } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function ordenarListaAportesDoMaisRecenteParaOMaisAntigo(listaAportes) {
    return [...(listaAportes || [])].sort((aporteA, aporteB) => {
        const dataA = String(aporteA.dataAporte || '');
        const dataB = String(aporteB.dataAporte || '');
        return dataB.localeCompare(dataA);
    });
}

export function renderizarPainelHistoricoAportes(painelHistoricoAportes, listaAportes) {
    const listaOrdenada = ordenarListaAportesDoMaisRecenteParaOMaisAntigo(listaAportes);

    if (!Array.isArray(listaOrdenada) || listaOrdenada.length === 0) {
        painelHistoricoAportes.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Nenhum aporte registrado.</div>
        `;
        return;
    }

    painelHistoricoAportes.innerHTML = listaOrdenada.map((aporte) => {
        const quantidadeComprada = converterParaNumeroSeguro(aporte.quantidadeComprada, 0);
        const precoPorCota = converterParaNumeroSeguro(aporte.precoPorCota, 0);
        const valorTotal = quantidadeComprada * precoPorCota;

        return `
            <div class="cartao-aporte">
                <div class="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-black text-amber-300">${escaparHtml(aporte.ticker || '--')}</span>
                            <span class="selo-status aporte">Aporte</span>
                        </div>

                        <div class="text-[11px] text-slate-400 mt-2">
                            Data: <strong>${escaparHtml(aporte.dataAporte || '--')}</strong>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <button
                            type="button"
                            class="botao-acao-tabela botao-editar-aporte"
                            data-id="${escaparHtml(aporte.id || '')}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="botao-acao-tabela botao-excluir-aporte"
                            data-id="${escaparHtml(aporte.id || '')}"
                        >
                            Excluir
                        </button>
                    </div>
                </div>

                <div class="grade-resumo-aporte">
                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Quantidade</div>
                        <div class="valor-resumo-aporte">${quantidadeComprada}</div>
                    </div>

                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Preço por cota</div>
                        <div class="valor-resumo-aporte">R$ ${formatarMoeda(precoPorCota)}</div>
                    </div>

                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Valor total</div>
                        <div class="valor-resumo-aporte">R$ ${formatarMoeda(valorTotal)}</div>
                    </div>

                    <div class="bloco-resumo-aporte">
                        <div class="rotulo-resumo-aporte">Origem</div>
                        <div class="valor-resumo-aporte">Histórico</div>
                    </div>
                </div>

                <div class="mt-4">
                    <div class="rotulo-resumo-aporte">Observação</div>
                    <div class="area-observacao-aporte">${escaparHtml(aporte.observacao || 'Sem observações cadastradas.')}</div>
                </div>
            </div>
        `;
    }).join('');
}