export function montarResumoSimulacaoAporte(ativo, valorAporte, patrimonioTotalCarteira) {
    if (!Number.isFinite(valorAporte) || valorAporte <= 0 || ativo.precoAtual <= 0) {
        return null;
    }

    const quantidadeCompravel = Math.floor(valorAporte / ativo.precoAtual);

    if (quantidadeCompravel <= 0) {
        return {
            quantidadeCompravel: 0,
            novoValorPosicao: ativo.valorTotalAtual,
            novoPeso: patrimonioTotalCarteira > 0 ? (ativo.valorTotalAtual / (patrimonioTotalCarteira + valorAporte)) * 100 : 0,
            aumentoRendaMensal: 0
        };
    }

    const novoValorPosicao = ativo.valorTotalAtual + (quantidadeCompravel * ativo.precoAtual);
    const novoPatrimonioTotal = patrimonioTotalCarteira + valorAporte;
    const novoPeso = novoPatrimonioTotal > 0 ? (novoValorPosicao / novoPatrimonioTotal) * 100 : 0;
    const aumentoRendaMensal = quantidadeCompravel * ativo.dividendoMensalEstimadoPorCota;

    return {
        quantidadeCompravel,
        novoValorPosicao,
        novoPeso,
        aumentoRendaMensal
    };
}
