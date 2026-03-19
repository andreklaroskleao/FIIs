export function renderizarGraficoProventos(canvas, instanciaAtual, listaLabels, listaValores) {
    if (!canvas) {
        return instanciaAtual;
    }

    if (instanciaAtual) {
        instanciaAtual.destroy();
    }

    const contexto = canvas.getContext('2d');

    return new Chart(contexto, {
        type: 'bar',
        data: {
            labels: listaLabels,
            datasets: [
                {
                    label: 'Proventos',
                    data: listaValores,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.03)' }
                },
                y: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.03)' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}

export function renderizarGraficoSegmentos(canvas, instanciaAtual, listaAtivos) {
    if (!canvas) {
        return instanciaAtual;
    }

    if (instanciaAtual) {
        instanciaAtual.destroy();
    }

    const mapaSegmentos = {};
    listaAtivos.forEach((ativo) => {
        mapaSegmentos[ativo.segmento] = (mapaSegmentos[ativo.segmento] || 0) + Number(ativo.valorTotalAtual || 0);
    });

    const listaLabels = Object.keys(mapaSegmentos);
    const listaValores = Object.values(mapaSegmentos);

    const contexto = canvas.getContext('2d');

    return new Chart(contexto, {
        type: 'doughnut',
        data: {
            labels: listaLabels,
            datasets: [
                {
                    data: listaValores,
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}