import { escaparHtml, formatarMoeda, formatarPercentual } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function montarLinhaComparador(rotulo, valorColuna1, valorColuna2) {
    return `
        <div class="celula-comparador rotulo">${escaparHtml(rotulo)}</div>
        <div class="celula-comparador valor">${valorColuna1}</div>
        <div class="celula-comparador valor">${valorColuna2}</div>
    `;
}

export function renderizarPainelComparador(painelComparador, listaAtivosSelecionados) {
    if (!painelComparador) {
        return;
    }

    const listaComparacao = Array.isArray(listaAtivosSelecionados)
        ? listaAtivosSelecionados.filter(Boolean)
        : [];

    if (listaComparacao.length === 0) {
        painelComparador.innerHTML = `
            <div class="text-[11px] text-slate-500 italic">Selecione até 2 ativos na tabela para comparar.</div>
        `;
        return;
    }

    if (listaComparacao.length === 1) {
        const ativo = listaComparacao[0];

        painelComparador.innerHTML = `
            <div class="cartao-comparador">
                <div class="font-black text-violet-400 mb-2">${escaparHtml(ativo.ticker)}</div>
                <div class="text-[11px] text-slate-300 mb-1">Segmento: <strong>${escaparHtml(ativo.segmento || 'Outros')}</strong></div>
                <div class="text-[11px] text-slate-300 mb-1">Preço atual: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoAtual, 0))}</strong></div>
                <div class="text-[11px] text-slate-300 mb-1">Preço teto: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.precoTeto, 0))}</strong></div>
                <div class="text-[11px] text-slate-300 mb-1">Renda mensal: <strong>R$ ${formatarMoeda(converterParaNumeroSeguro(ativo.rendaMensalEstimada, 0))}</strong></div>
                <div class="text-[11px] text-slate-300">Adicione mais um ativo para comparação lado a lado.</div>
            </div>
        `;
        return;
    }

    const [ativo1, ativo2] = listaComparacao;

    painelComparador.innerHTML = `
        <div class="grade-comparador">
            ${montarLinhaComparador('Ticker', escaparHtml(ativo1.ticker), escaparHtml(ativo2.ticker))}
            ${montarLinhaComparador('Segmento', escaparHtml(ativo1.segmento || 'Outros'), escaparHtml(ativo2.segmento || 'Outros'))}
            ${montarLinhaComparador('Nota', String(converterParaNumeroSeguro(ativo1.nota, 0)), String(converterParaNumeroSeguro(ativo2.nota, 0)))}
            ${montarLinhaComparador('Preço atual', `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo1.precoAtual, 0))}`, `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo2.precoAtual, 0))}`)}
            ${montarLinhaComparador('Preço teto', `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo1.precoTeto, 0))}`, `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo2.precoTeto, 0))}`)}
            ${montarLinhaComparador('Preço médio', `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo1.precoMedio, 0))}`, `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo2.precoMedio, 0))}`)}
            ${montarLinhaComparador('Quantidade', String(converterParaNumeroSeguro(ativo1.quantidade, 0)), String(converterParaNumeroSeguro(ativo2.quantidade, 0)))}
            ${montarLinhaComparador('Patrimônio', `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo1.valorTotalAtual, 0))}`, `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo2.valorTotalAtual, 0))}`)}
            ${montarLinhaComparador('Lucro / prejuízo', `${formatarPercentual(converterParaNumeroSeguro(ativo1.lucroPrejuizoPercentual, 0))}`, `${formatarPercentual(converterParaNumeroSeguro(ativo2.lucroPrejuizoPercentual, 0))}`)}
            ${montarLinhaComparador('Renda mensal', `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo1.rendaMensalEstimada, 0))}`, `R$ ${formatarMoeda(converterParaNumeroSeguro(ativo2.rendaMensalEstimada, 0))}`)}
            ${montarLinhaComparador('Data com', ativo1.diaDataCom ? `Dia ${ativo1.diaDataCom}` : '--', ativo2.diaDataCom ? `Dia ${ativo2.diaDataCom}` : '--')}
            ${montarLinhaComparador('Pagamento', ativo1.diaPagamento ? `Dia ${ativo1.diaPagamento}` : '--', ativo2.diaPagamento ? `Dia ${ativo2.diaPagamento}` : '--')}
        </div>
    `;
}