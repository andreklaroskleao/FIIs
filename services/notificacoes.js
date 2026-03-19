export function mostrarNotificacao(containerNotificacoes, mensagem, tipo = 'info') {
    if (!containerNotificacoes) {
        return;
    }

    const elementoNotificacao = document.createElement('div');
    elementoNotificacao.className = `notificacao notificacao-${tipo}`;
    elementoNotificacao.textContent = mensagem;

    containerNotificacoes.appendChild(elementoNotificacao);

    setTimeout(() => {
        elementoNotificacao.remove();
    }, 3500);
}