import { escaparHtml, formatarMoeda, formatarPercentual } from '../services/formatadores.js';

export function renderizarPainelComparador(painelComparador, listaAtivosComparacao) {
    if (!listaAtivosComparacao.length) {
        painelComparador.innerHTML = '<div class="text-[11px] text-slate-500 italic">Selecione até 2 ativos na tabela para comparar.</div>';
        return;
    }

    if (listaAtivosComparacao.length === 1) {
        painelComparador.innerHTML = `
            <div class="cartao-comparador">
                <div class="text-[11px] text-slate-400">Ativo selecionado</div>
                <div class="font-black text-white mt-1">${escaparHtml(listaAtivosComparacao[0].ticker)}</div>
                <div class="text-[11px] text-slate-500 mt-2">Selecione mais um ativo para comparação lado a lado.</div>
            </div>
        `;
        return;
    }

    const [ativoA, ativoB] = listaAtivosComparacao;

    const linhas = [
        ['Ticker', ativoA.ticker, ativoB.ticker],
        ['Segmento', ativoA.segmento, ativoB.segmento],
        ['Preço atual', `R$ ${formatarMoeda(ativoA.precoAtual)}`, `R$ ${formatarMoeda(ativoB.precoAtual)}`],
        ['Preço médio', `R$ ${formatarMoeda(ativoA.precoMedio)}`, `R$ ${formatarMoeda(ativoB.precoMedio)}`],
        ['Quantidade', String(ativoA.quantidade), String(ativoB.quantidade)],
        ['Posição', `R$ ${formatarMoeda(ativoA.valorTotalAtual)}`, `R$ ${formatarMoeda(ativoB.valorTotalAtual)}`],
        ['Renda mensal', `R$ ${formatarMoeda(ativoA.rendaMensalEstimada)}`, `R$ ${formatarMoeda(ativoB.rendaMensalEstimada)}`],
        ['Resultado', formatarPercentual(ativoA.lucroPrejuizoPercentual), formatarPercentual(ativoB.lucroPrejuizoPercentual)],
        ['Nota', String(ativoA.nota), String(ativoB.nota)]
    ];

    painelComparador.innerHTML = `
        <div class="grade-comparador">
            ${linhas.map(([rotulo, valorA, valorB]) => {
                return `
                    <div class="celula-comparador rotulo">${escaparHtml(rotulo)}</div>
                    <div class="celula-comparador valor">${escaparHtml(valorA)}</div>
                    <div class="celula-comparador valor">${escaparHtml(valorB)}</div>
                `;
            }).join('')}
        </div>
    `;
}