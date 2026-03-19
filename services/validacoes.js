export const LISTA_SEGMENTOS_VALIDOS = ['Papel', 'Tijolo', 'Agro', 'Fundo de Fundo', 'Outros'];

export function validarDiaDoMes(valor) {
    if (valor === '' || valor === null || typeof valor === 'undefined') {
        return null;
    }

    const diaConvertido = parseInt(valor, 10);

    if (!Number.isInteger(diaConvertido) || diaConvertido < 1 || diaConvertido > 31) {
        return null;
    }

    return diaConvertido;
}

export function validarTicker(ticker) {
    return /^[A-Z0-9]{4,12}$/.test(ticker);
}

export function limparErrosDosCampos(listaCampos) {
    listaCampos.forEach((campo) => {
        campo.classList.remove('campo-com-erro');
        const elementoErro = document.getElementById(`erro-${campo.id}`);
        if (elementoErro) {
            elementoErro.textContent = '';
            elementoErro.classList.add('hidden');
        }
    });
}

export function marcarCampoComErro(identificadorCampo, mensagem) {
    const campo = document.getElementById(identificadorCampo);
    const elementoErro = document.getElementById(`erro-${identificadorCampo}`);

    if (campo) {
        campo.classList.add('campo-com-erro');
    }

    if (elementoErro) {
        elementoErro.textContent = mensagem;
        elementoErro.classList.remove('hidden');
    }
}

export function validarDadosAtivo(dadosAtivo, camposFormularioAtivo) {
    limparErrosDosCampos(Object.values(camposFormularioAtivo));

    let formularioValido = true;

    if (!dadosAtivo.ticker || !validarTicker(dadosAtivo.ticker)) {
        marcarCampoComErro('campo-ticker-ativo', 'Informe um ticker válido, sem espaços.');
        formularioValido = false;
    }

    if (dadosAtivo.quantidade <= 0 || !Number.isInteger(dadosAtivo.quantidade)) {
        marcarCampoComErro('campo-quantidade-ativo', 'A quantidade deve ser um inteiro maior que zero.');
        formularioValido = false;
    }

    if (dadosAtivo.precoMedio < 0) {
        marcarCampoComErro('campo-preco-medio-ativo', 'O preço médio não pode ser negativo.');
        formularioValido = false;
    }

    if (dadosAtivo.nota < 1 || dadosAtivo.nota > 10) {
        marcarCampoComErro('campo-nota-ativo', 'A nota deve ficar entre 1 e 10.');
        formularioValido = false;
    }

    if (dadosAtivo.precoTeto < 0) {
        marcarCampoComErro('campo-preco-teto-ativo', 'O preço teto não pode ser negativo.');
        formularioValido = false;
    }

    if (dadosAtivo.diaDataCom === null && camposFormularioAtivo.diaDataCom.value !== '') {
        marcarCampoComErro('campo-dia-data-com', 'Use um dia entre 1 e 31.');
        formularioValido = false;
    }

    if (dadosAtivo.diaPagamento === null && camposFormularioAtivo.diaPagamento.value !== '') {
        marcarCampoComErro('campo-dia-pagamento', 'Use um dia entre 1 e 31.');
        formularioValido = false;
    }

    if (!LISTA_SEGMENTOS_VALIDOS.includes(dadosAtivo.segmento)) {
        marcarCampoComErro('campo-segmento-ativo', 'Escolha um segmento válido.');
        formularioValido = false;
    }

    return formularioValido;
}

export function validarDadosProvento(dadosProvento, camposFormularioProvento) {
    limparErrosDosCampos(Object.values(camposFormularioProvento));

    let formularioValido = true;

    if (!dadosProvento.ticker || !validarTicker(dadosProvento.ticker)) {
        marcarCampoComErro('campo-ticker-provento', 'Informe um ticker válido.');
        formularioValido = false;
    }

    if (!Number.isFinite(dadosProvento.valor) || dadosProvento.valor <= 0) {
        marcarCampoComErro('campo-valor-provento', 'Informe um valor maior que zero.');
        formularioValido = false;
    }

    if (!dadosProvento.mesAno || !/^\d{4}-\d{2}$/.test(dadosProvento.mesAno)) {
        marcarCampoComErro('campo-mes-provento', 'Selecione um mês válido.');
        formularioValido = false;
    }

    return formularioValido;
}
