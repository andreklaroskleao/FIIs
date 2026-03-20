function destruirGraficoSeExistir(instanciaGraficoAtual) {
    if (instanciaGraficoAtual && typeof instanciaGraficoAtual.destroy === 'function') {
        instanciaGraficoAtual.destroy();
    }
}

function obterConfiguracaoPadraoLegenda() {
    return {
        labels: {
            color: '#cbd5e1',
            font: {
                size: 11,
                weight: '700'
            }
        }
    };
}

export function renderizarGraficoProventos(
    elementoCanvas,
    instanciaGraficoAtual,
    listaRotulos,
    listaValores
) {
    if (!elementoCanvas || typeof Chart === 'undefined') {
        return null;
    }

    destruirGraficoSeExistir(instanciaGraficoAtual);

    const contexto = elementoCanvas.getContext('2d');

    return new Chart(contexto, {
        type: 'bar',
        data: {
            labels: listaRotulos || [],
            datasets: [
                {
                    label: 'Proventos',
                    data: listaValores || [],
                    borderWidth: 1,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: obterConfiguracaoPadraoLegenda(),
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 10,
                            weight: '700'
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.08)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            size: 10,
                            weight: '700'
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.08)'
                    }
                }
            }
        }
    });
}

export function renderizarGraficoSegmentos(
    elementoCanvas,
    instanciaGraficoAtual,
    listaAtivos
) {
    if (!elementoCanvas || typeof Chart === 'undefined') {
        return null;
    }

    destruirGraficoSeExistir(instanciaGraficoAtual);

    const mapaSegmentos = {};

    (listaAtivos || []).forEach((ativo) => {
        const segmento = ativo.segmento || 'Outros';
        const valorTotalAtual = Number(ativo.valorTotalAtual) || 0;

        if (!mapaSegmentos[segmento]) {
            mapaSegmentos[segmento] = 0;
        }

        mapaSegmentos[segmento] += valorTotalAtual;
    });

    const listaRotulos = Object.keys(mapaSegmentos);
    const listaValores = Object.values(mapaSegmentos);

    const contexto = elementoCanvas.getContext('2d');

    return new Chart(contexto, {
        type: 'doughnut',
        data: {
            labels: listaRotulos,
            datasets: [
                {
                    label: 'Segmentos',
                    data: listaValores,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: obterConfiguracaoPadraoLegenda(),
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}