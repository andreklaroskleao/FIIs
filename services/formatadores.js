export function escaparHtml(valor) {
    return String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function normalizarTicker(valor) {
    return String(valor || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function formatarMoeda(valor, casasDecimais = 2) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    });
}

export function formatarMesAno(valorMesAno) {
    if (!valorMesAno || !valorMesAno.includes('-')) {
        return '--';
    }

    const [ano, mes] = valorMesAno.split('-');
    return `${mes}/${ano}`;
}

export function obterClasseResultadoValor(valor) {
    if (valor > 0) return 'valor-positivo';
    if (valor < 0) return 'valor-negativo';
    return '';
}
