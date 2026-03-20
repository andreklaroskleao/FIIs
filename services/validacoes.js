function definirErroNoCampo(campo, elementoMensagem, mensagem) {
    if (campo) {
        campo.classList.add('campo-com-erro');
    }

    if (elementoMensagem) {
        elementoMensagem.textContent = mensagem;
        elementoMensagem.classList.remove('hidden');
    }
}

function limparErroNoCampo(campo, elementoMensagem) {
    if (campo) {
        campo.classList.remove('campo-com-erro');
    }

    if (elementoMensagem) {
        elementoMensagem.textContent = '';
        elementoMensagem.classList.add('hidden');
    }
}

function obterElementoErroPeloCampo(campo) {
    if (!campo || !campo.id) {
        return null;
    }

    return document.getElementById(`erro-${campo.id}`);
}

export function limparErrosDosCampos(listaCampos) {
    listaCampos.forEach((campo) => {
        const elementoMensagem = obterElementoErroPeloCampo(campo);
        limparErroNoCampo(campo, elementoMensagem);
    });
}

export function validarDiaDoMes(valor) {
    if (valor === '' || valor === null || valor === undefined) {
        return null;
    }

    const numeroConvertido = Number(valor);

    if (!Number.isInteger(numeroConvertido)) {
        return null;
    }

    if (numeroConvertido < 1 || numeroConvertido > 31) {
        return null;
    }

    return numeroConvertido;
}

export function validarDadosAtivo(dadosAtivo, camposFormularioAtivo) {
    let formularioValido = true;

    limparErrosDosCampos(Object.values(camposFormularioAtivo).filter(Boolean));

    if (!dadosAtivo.ticker || dadosAtivo.ticker.length < 4) {
        definirErroNoCampo(
            camposFormularioAtivo.ticker,
            obterElementoErroPeloCampo(camposFormularioAtivo.ticker),
            'Informe um ticker válido.'
        );
        formularioValido = false;
    }

    if (!Number.isInteger(dadosAtivo.quantidade) || dadosAtivo.quantidade <= 0) {
        definirErroNoCampo(
            camposFormularioAtivo.quantidade,
            obterElementoErroPeloCampo(camposFormularioAtivo.quantidade),
            'A quantidade deve ser maior que zero.'
        );
        formularioValido = false;
    }

    if (!Number.isFinite(Number(dadosAtivo.precoMedio)) || Number(dadosAtivo.precoMedio) <= 0) {
        definirErroNoCampo(
            camposFormularioAtivo.precoMedio,
            obterElementoErroPeloCampo(camposFormularioAtivo.precoMedio),
            'Informe um preço médio válido.'
        );
        formularioValido = false;
    }

    if (!Number.isInteger(dadosAtivo.nota) || dadosAtivo.nota < 1 || dadosAtivo.nota > 10) {
        definirErroNoCampo(
            camposFormularioAtivo.nota,
            obterElementoErroPeloCampo(camposFormularioAtivo.nota),
            'A nota deve ficar entre 1 e 10.'
        );
        formularioValido = false;
    }

    if (!Number.isFinite(Number(dadosAtivo.precoTeto)) || Number(dadosAtivo.precoTeto) <= 0) {
        definirErroNoCampo(
            camposFormularioAtivo.precoTeto,
            obterElementoErroPeloCampo(camposFormularioAtivo.precoTeto),
            'Informe um preço teto válido.'
        );
        formularioValido = false;
    }

    if (
        dadosAtivo.precoAtualManual !== null &&
        dadosAtivo.precoAtualManual !== undefined &&
        dadosAtivo.precoAtualManual !== '' &&
        (!Number.isFinite(Number(dadosAtivo.precoAtualManual)) || Number(dadosAtivo.precoAtualManual) <= 0)
    ) {
        definirErroNoCampo(
            camposFormularioAtivo.precoAtualManual,
            obterElementoErroPeloCampo(camposFormularioAtivo.precoAtualManual),
            'Se informado, o preço atual manual deve ser maior que zero.'
        );
        formularioValido = false;
    }

    if (!dadosAtivo.segmento || String(dadosAtivo.segmento).trim() === '') {
        definirErroNoCampo(
            camposFormularioAtivo.segmento,
            obterElementoErroPeloCampo(camposFormularioAtivo.segmento),
            'Selecione um segmento.'
        );
        formularioValido = false;
    }

    const valorDigitadoDiaDataCom = camposFormularioAtivo.diaDataCom?.value;
    if (valorDigitadoDiaDataCom !== '' && dadosAtivo.diaDataCom === null) {
        definirErroNoCampo(
            camposFormularioAtivo.diaDataCom,
            obterElementoErroPeloCampo(camposFormularioAtivo.diaDataCom),
            'O dia da data com deve ficar entre 1 e 31.'
        );
        formularioValido = false;
    }

    const valorDigitadoDiaPagamento = camposFormularioAtivo.diaPagamento?.value;
    if (valorDigitadoDiaPagamento !== '' && dadosAtivo.diaPagamento === null) {
        definirErroNoCampo(
            camposFormularioAtivo.diaPagamento,
            obterElementoErroPeloCampo(camposFormularioAtivo.diaPagamento),
            'O dia do pagamento deve ficar entre 1 e 31.'
        );
        formularioValido = false;
    }

    return formularioValido;
}

export function validarDadosProvento(dadosProvento, camposFormularioProvento) {
    let formularioValido = true;

    limparErrosDosCampos(Object.values(camposFormularioProvento).filter(Boolean));

    if (!dadosProvento.ticker || dadosProvento.ticker.length < 4) {
        definirErroNoCampo(
            camposFormularioProvento.ticker,
            obterElementoErroPeloCampo(camposFormularioProvento.ticker),
            'Informe um ticker válido.'
        );
        formularioValido = false;
    }

    if (!Number.isFinite(Number(dadosProvento.valor)) || Number(dadosProvento.valor) <= 0) {
        definirErroNoCampo(
            camposFormularioProvento.valor,
            obterElementoErroPeloCampo(camposFormularioProvento.valor),
            'Informe um valor válido maior que zero.'
        );
        formularioValido = false;
    }

    if (!dadosProvento.mesAno || !/^\d{4}-\d{2}$/.test(dadosProvento.mesAno)) {
        definirErroNoCampo(
            camposFormularioProvento.mes,
            obterElementoErroPeloCampo(camposFormularioProvento.mes),
            'Selecione um mês válido.'
        );
        formularioValido = false;
    }

    return formularioValido;
}