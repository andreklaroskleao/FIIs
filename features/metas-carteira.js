import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function calcularPercentualAtualEmRelacaoAMeta(valorAtual, valorMeta) {
    const valorAtualSeguro = converterParaNumeroSeguro(valorAtual, 0);
    const valorMetaSeguro = converterParaNumeroSeguro(valorMeta, 0);

    if (valorMetaSeguro <= 0) {
        return 0;
    }

    return (valorAtualSeguro / valorMetaSeguro) * 100;
}

export function calcularProgressoMetaPatrimonio(patrimonioAtual, metaPatrimonio) {
    const patrimonioAtualSeguro = converterParaNumeroSeguro(patrimonioAtual, 0);
    const metaPatrimonioSegura = converterParaNumeroSeguro(metaPatrimonio, 0);

    const percentualAtual = calcularPercentualAtualEmRelacaoAMeta(
        patrimonioAtualSeguro,
        metaPatrimonioSegura
    );

    const percentualExibicao = Math.min(100, percentualAtual);
    const valorRestante = Math.max(0, metaPatrimonioSegura - patrimonioAtualSeguro);
    const metaConcluida = metaPatrimonioSegura > 0 && patrimonioAtualSeguro >= metaPatrimonioSegura;

    return {
        titulo: 'Meta de patrimônio',
        valorAtual: patrimonioAtualSeguro,
        valorMeta: metaPatrimonioSegura,
        valorRestante,
        percentualAtual,
        percentualExibicao,
        metaConcluida
    };
}

export function calcularProgressoMetaRenda(rendaMensalAtual, metaRendaMensal) {
    const rendaMensalAtualSegura = converterParaNumeroSeguro(rendaMensalAtual, 0);
    const metaRendaMensalSegura = converterParaNumeroSeguro(metaRendaMensal, 0);

    const percentualAtual = calcularPercentualAtualEmRelacaoAMeta(
        rendaMensalAtualSegura,
        metaRendaMensalSegura
    );

    const percentualExibicao = Math.min(100, percentualAtual);
    const valorRestante = Math.max(0, metaRendaMensalSegura - rendaMensalAtualSegura);
    const metaConcluida = metaRendaMensalSegura > 0 && rendaMensalAtualSegura >= metaRendaMensalSegura;

    return {
        titulo: 'Meta de renda mensal',
        valorAtual: rendaMensalAtualSegura,
        valorMeta: metaRendaMensalSegura,
        valorRestante,
        percentualAtual,
        percentualExibicao,
        metaConcluida
    };
}