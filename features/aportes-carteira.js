import {
    collection,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { normalizarTicker } from '../services/formatadores.js';

function converterParaNumeroPositivo(valor) {
    const numeroConvertido = Number(valor);

    if (!Number.isFinite(numeroConvertido) || numeroConvertido <= 0) {
        return null;
    }

    return numeroConvertido;
}

export function montarDadosAporte({
    usuarioAtual,
    ticker,
    quantidadeComprada,
    precoPorCota,
    dataAporte,
    observacao
}) {
    if (!usuarioAtual || !usuarioAtual.uid) {
        throw new Error('Usuário não autenticado.');
    }

    const tickerNormalizado = normalizarTicker(ticker);
    const quantidadeConvertida = Number.parseInt(quantidadeComprada, 10);
    const precoConvertido = converterParaNumeroPositivo(precoPorCota);

    if (!tickerNormalizado || tickerNormalizado.length < 4) {
        throw new Error('Informe um ticker válido para o aporte.');
    }

    if (!Number.isInteger(quantidadeConvertida) || quantidadeConvertida <= 0) {
        throw new Error('A quantidade comprada deve ser maior que zero.');
    }

    if (precoConvertido === null) {
        throw new Error('O preço por cota deve ser maior que zero.');
    }

    if (!dataAporte) {
        throw new Error('Informe a data do aporte.');
    }

    return {
        uid: usuarioAtual.uid,
        ticker: tickerNormalizado,
        quantidadeComprada: quantidadeConvertida,
        precoPorCota: precoConvertido,
        dataAporte,
        observacao: String(observacao || '').trim(),
        timestamp: serverTimestamp()
    };
}

export async function salvarAporteNoFirestore({
    db,
    identificadorAporteEmEdicao,
    dadosAporte
}) {
    if (!db) {
        throw new Error('Banco de dados não disponível.');
    }

    if (identificadorAporteEmEdicao) {
        await updateDoc(doc(db, 'aportes', identificadorAporteEmEdicao), dadosAporte);
        return 'Aporte atualizado com sucesso.';
    }

    await addDoc(collection(db, 'aportes'), dadosAporte);
    return 'Aporte registrado com sucesso.';
}

export async function excluirAporteNoFirestore({
    db,
    identificadorAporte
}) {
    if (!db) {
        throw new Error('Banco de dados não disponível.');
    }

    if (!identificadorAporte) {
        throw new Error('Identificador do aporte não informado.');
    }

    await deleteDoc(doc(db, 'aportes', identificadorAporte));
}