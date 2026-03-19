export function mostrarNotificacao(containerNotificacoes, mensagem, tipo = 'info') {
    if (!containerNotificacoes) {
        return;
    }

    const notificacao = document.createElement('div');
    notificacao.className = 'notificacao';

    if (tipo === 'sucesso') {
        notificacao.classList.add('notificacao-sucesso');
    } else if (tipo === 'erro') {
        notificacao.classList.add('notificacao-erro');
    } else {
        notificacao.classList.add('notificacao-info');
    }

    notificacao.textContent = mensagem;
    containerNotificacoes.appendChild(notificacao);

    const removerNotificacao = () => {
        if (notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
        }
    };

    setTimeout(removerNotificacao, 3500);
}