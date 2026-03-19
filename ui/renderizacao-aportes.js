import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';
import { normalizarTicker } from '../services/formatadores.js';

export function validarDadosAporte(dadosAporte) {
    if (!dadosAporte.ticker) {
        throw new Error('Informe o ticker do aporte.');
    }

    if (!Number.isFinite(dadosAporte.quantidadeComprada) || dadosAporte.quantidadeComprada <= 0) {
        throw new Error('Informe uma quantidade válida para o aporte.');
    }

    if (!Number.isFinite(dadosAporte.precoPorCota) || dadosAporte.precoPorCota <= 0) {
        throw new Error('Informe um preço por cota válido.');
    }

    if (!dadosAporte.dataAporte) {
        throw new Error('Informe a data do aporte.');
    }
}

export function montarDadosAporte({ usuarioAtual, ticker, quantidadeComprada, precoPorCota, dataAporte, observacao }) {
    const quantidadeConvertida = parseInt(quantidadeComprada, 10);
    const precoConvertido = converterParaNumeroSeguro(precoPorCota, NaN);

    const dadosAporte = {
        uid: usuarioAtual.uid,
        ticker: normalizarTicker(ticker),
        quantidadeComprada: quantidadeConvertida,
        precoPorCota: precoConvertido,
        valorTotalAporte: quantidadeConvertida * precoConvertido,
        dataAporte,
        observacao: observacao || '',
        timestamp: serverTimestamp()
    };

    validarDadosAporte(dadosAporte);
    return dadosAporte;
}

export async function salvarAporteNoFirestore({ db, identificadorAporteEmEdicao, dadosAporte }) {
    if (identificadorAporteEmEdicao) {
        await updateDoc(doc(db, 'aportes', identificadorAporteEmEdicao), dadosAporte);
        return 'Aporte atualizado com sucesso.';
    }

    await addDoc(collection(db, 'aportes'), dadosAporte);
    return 'Aporte registrado com sucesso.';
}

export async function excluirAporteNoFirestore({ db, identificadorAporte }) {
    await deleteDoc(doc(db, 'aportes', identificadorAporte));
}

export function recalcularResumoDoAtivoComAportes(ativoBase, listaAportesDoTicker) {
    if (!ativoBase) {
        return null;
    }

    if (!listaAportesDoTicker.length) {
        return {
            ...ativoBase,
            quantidadeCalculadaPorAportes: ativoBase.quantidade,
            precoMedioCalculadoPorAportes: ativoBase.precoMedio,
            valorInvestidoCalculadoPorAportes: ativoBase.quantidade * ativoBase.precoMedio
        };
    }

    let quantidadeCalculada = 0;
    let valorInvestidoCalculado = 0;

    listaAportesDoTicker.forEach((aporte) => {
        quantidadeCalculada += Number(aporte.quantidadeComprada || 0);
        valorInvestidoCalculado += Number(aporte.valorTotalAporte || 0);
    });

    const precoMedioCalculadoPorAportes = quantidadeCalculada > 0
        ? valorInvestidoCalculado / quantidadeCalculada
        : 0;

    return {
        ...ativoBase,
        quantidadeCalculadaPorAportes: quantidadeCalculada,
        precoMedioCalculadoPorAportes,
        valorInvestidoCalculadoPorAportes: valorInvestidoCalculado
    };
}
