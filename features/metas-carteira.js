export function calcularProgressoMetaPatrimonio(patrimonioAtual, metaPatrimonio) {
    const meta = Number(metaPatrimonio) || 0;

    if (meta <= 0) {
        return {
            percentualConcluido: 0,
            valorFaltante: 0
        };
    }

    const percentualConcluido = (Number(patrimonioAtual || 0) / meta) * 100;
    const valorFaltante = Math.max(0, meta - Number(patrimonioAtual || 0));

    return {
        percentualConcluido,
        valorFaltante
    };
}

export function calcularProgressoMetaRenda(rendaMensalAtual, metaRendaMensal) {
    const meta = Number(metaRendaMensal) || 0;

    if (meta <= 0) {
        return {
            percentualConcluido: 0,
            valorFaltante: 0
        };
    }

    const percentualConcluido = (Number(rendaMensalAtual || 0) / meta) * 100;
    const valorFaltante = Math.max(0, meta - Number(rendaMensalAtual || 0));

    return {
        percentualConcluido,
        valorFaltante
    };
}