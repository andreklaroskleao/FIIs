export function renderizarGraficoProventos(canvas, instanciaAtual, listaLabels, listaValores) {
    if (typeof Chart === 'undefined') {
        return null;
    }

    if (instanciaAtual) {
        instanciaAtual.destroy();
    }

    const labelsFinais = listaLabels.length ? listaLabels : ['Sem dados'];
    const valoresFinais = listaValores.length ? listaValores : [0];

    Chart.defaults.color = '#64748b';
    Chart.defaults.font.family = "'Inter', sans-serif";

    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labelsFinais,
            datasets: [
                {
                    label: 'Proventos recebidos (R$)',
                    data: valoresFinais,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label(contexto) {
                            return `R$ ${Number(contexto.raw || 0).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

export function renderizarGraficoSegmentos(canvas, instanciaAtual, listaAtivos) {
    if (typeof Chart === 'undefined') {
        return null;
    }

    if (instanciaAtual) {
        instanciaAtual.destroy();
    }

    const mapaValoresPorSegmento = {};

    listaAtivos.forEach((ativo) => {
        const segmento = ativo.segmento || 'Outros';
        mapaValoresPorSegmento[segmento] = (mapaValoresPorSegmento[segmento] || 0) + (ativo.valorTotalAtual || 0);
    });

    const listaSegmentos = Object.keys(mapaValoresPorSegmento);
    const listaValores = listaSegmentos.map((segmento) => mapaValoresPorSegmento[segmento]);

    return new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: listaSegmentos.length ? listaSegmentos : ['Sem dados'],
            datasets: [
                {
                    data: listaValores.length ? listaValores : [1],
                    backgroundColor: ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'],
                    borderColor: '#020617',
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#cbd5e1',
                        boxWidth: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        label(contexto) {
                            return `${contexto.label}: R$ ${Number(contexto.raw || 0).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`;
                        }
                    }
                }
            }
        }
    });
}
