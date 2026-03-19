export function escaparHtml(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function normalizarTicker(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    return String(valor)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '');
}

export function formatarMoeda(valor, quantidadeCasasDecimais = 2) {
    const numeroConvertido = Number(valor);

    if (!Number.isFinite(numeroConvertido)) {
        return Number(0).toFixed(quantidadeCasasDecimais).replace('.', ',');
    }

    return numeroConvertido.toLocaleString('pt-BR', {
        minimumFractionDigits: quantidadeCasasDecimais,
        maximumFractionDigits: quantidadeCasasDecimais
    });
}

export function formatarPercentual(valor, quantidadeCasasDecimais = 2) {
    const numeroConvertido = Number(valor);

    if (!Number.isFinite(numeroConvertido)) {
        return `0,00%`;
    }

    return `${numeroConvertido.toLocaleString('pt-BR', {
        minimumFractionDigits: quantidadeCasasDecimais,
        maximumFractionDigits: quantidadeCasasDecimais
    })}%`;
}

export function formatarMesAno(valorMesAno) {
    if (!valorMesAno || typeof valorMesAno !== 'string') {
        return '--';
    }

    const correspondencia = valorMesAno.match(/^(\d{4})-(\d{2})$/);

    if (!correspondencia) {
        return valorMesAno;
    }

    const ano = Number(correspondencia[1]);
    const mes = Number(correspondencia[2]);

    const nomesMeses = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez'
    ];

    if (mes < 1 || mes > 12) {
        return valorMesAno;
    }

    return `${nomesMeses[mes - 1]}/${ano}`;
}

export function obterClasseResultadoValor(valor) {
    const numeroConvertido = Number(valor);

    if (!Number.isFinite(numeroConvertido) || numeroConvertido === 0) {
        return '';
    }

    return numeroConvertido > 0 ? 'valor-positivo' : 'valor-negativo';
}