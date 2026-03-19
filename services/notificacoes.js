export function mostrarNotificacao(containerNotificacoes, mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;

    containerNotificacoes.appendChild(notificacao);

    setTimeout(() => {
        notificacao.remove();
    }, 3200);
}
