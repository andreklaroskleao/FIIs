export const LISTA_SEGMENTOS_VALIDOS = [
    'Papel',
    'Tijolo',
    'Agro',
    'Fundo de Fundo',
    'Outros'
];

export function validarDiaDoMes(valor) {
    if (valor === null || valor === undefined || valor === '') {
        return null;
    }

    const numero = Number(valor);

    if (!Number.isInteger(numero) || numero < 1 || numero > 31) {
        return null;
    }

    return numero;
}

function mostrarErroCampo(campo, mensagem) {
    if (!campo) {
        return;
    }

    campo.classList.add('campo-com-erro');

    const elementoErro = document.getElementById(`erro-${campo.id}`);
    if (elementoErro) {
        elementoErro.textContent = mensagem;
        elementoErro.classList.remove('hidden');
    }
}

function limparErroCampo(campo) {
    if (!campo) {
        return;
    }

    campo.classList.remove('campo-com-erro');

    const elementoErro = document.getElementById(`erro-${campo.id}`);
    if (elementoErro) {
        elementoErro.textContent = '';
        elementoErro.classList.add('hidden');
    }
}

export function limparErrosDosCampos(listaCampos) {
    listaCampos.forEach((campo) => limparErroCampo(campo));
}

export function validarDadosAtivo(dadosAtivo, camposFormularioAtivo) {
    let formularioValido = true;
    limparErrosDosCampos(Object.values(camposFormularioAtivo));

    if (!dadosAtivo.ticker) {
        mostrarErroCampo(camposFormularioAtivo.ticker, 'Informe o ticker.');
        formularioValido = false;
    }

    if (!Number.isInteger(dadosAtivo.quantidade) || dadosAtivo.quantidade <= 0) {
        mostrarErroCampo(camposFormularioAtivo.quantidade, 'Informe uma quantidade válida.');
        formularioValido = false;
    }

    if (!Number.isFinite(dadosAtivo.precoMedio) || dadosAtivo.precoMedio <= 0) {
        mostrarErroCampo(camposFormularioAtivo.precoMedio, 'Informe um preço médio válido.');
        formularioValido = false;
    }

    if (!Number.isInteger(dadosAtivo.nota) || dadosAtivo.nota < 1 || dadosAtivo.nota > 10) {
        mostrarErroCampo(camposFormularioAtivo.nota, 'Informe uma nota entre 1 e 10.');
        formularioValido = false;
    }

    if (!Number.isFinite(dadosAtivo.precoTeto) || dadosAtivo.precoTeto < 0) {
        mostrarErroCampo(camposFormularioAtivo.precoTeto, 'Informe um preço teto válido.');
        formularioValido = false;
    }

    if (!LISTA_SEGMENTOS_VALIDOS.includes(dadosAtivo.segmento)) {
        mostrarErroCampo(camposFormularioAtivo.segmento, 'Selecione um segmento válido.');
        formularioValido = false;
    }

    if (camposFormularioAtivo.diaDataCom.value && dadosAtivo.diaDataCom === null) {
        mostrarErroCampo(camposFormularioAtivo.diaDataCom, 'Informe um dia entre 1 e 31.');
        formularioValido = false;
    }

    if (camposFormularioAtivo.diaPagamento.value && dadosAtivo.diaPagamento === null) {
        mostrarErroCampo(camposFormularioAtivo.diaPagamento, 'Informe um dia entre 1 e 31.');
        formularioValido = false;
    }

    return formularioValido;
}

export function validarDadosProvento(dadosProvento, camposFormularioProvento) {
    let formularioValido = true;
    limparErrosDosCampos(Object.values(camposFormularioProvento));

    if (!dadosProvento.ticker) {
        mostrarErroCampo(camposFormularioProvento.ticker, 'Informe o ticker.');
        formularioValido = false;
    }

    if (!Number.isFinite(dadosProvento.valor) || dadosProvento.valor <= 0) {
        mostrarErroCampo(camposFormularioProvento.valor, 'Informe um valor válido.');
        formularioValido = false;
    }

    if (!dadosProvento.mesAno) {
        mostrarErroCampo(camposFormularioProvento.mes, 'Informe o mês do provento.');
        formularioValido = false;
    }

    return formularioValido;
}