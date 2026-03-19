export function escaparHtml(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function normalizarTicker(ticker) {
    return String(ticker ?? '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '');
}

export function formatarMoeda(valor, casasDecimais = 2) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return (0).toLocaleString('pt-BR', {
            minimumFractionDigits: casasDecimais,
            maximumFractionDigits: casasDecimais
        });
    }

    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    });
}

export function formatarPercentual(valor, casasDecimais = 2) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return '0,00%';
    }

    return `${numero.toLocaleString('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    })}%`;
}

export function formatarMesAno(valorMesAno) {
    if (!valorMesAno || !/^\d{4}-\d{2}$/.test(valorMesAno)) {
        return valorMesAno || '--';
    }

    const [ano, mes] = valorMesAno.split('-');
    const data = new Date(Number(ano), Number(mes) - 1, 1);

    return data.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
    });
}

export function obterClasseResultadoValor(valor) {
    return Number(valor) >= 0 ? 'valor-positivo' : 'valor-negativo';
}