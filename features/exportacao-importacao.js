import {
    collection,
    addDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

function baixarArquivo(nomeArquivo, conteudo, tipoMime) {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function exportarCarteiraParaJson(listaAtivos, listaProventos) {
    const dados = {
        exportadoEm: new Date().toISOString(),
        ativos: listaAtivos.map((ativo) => ({
            ticker: ativo.ticker,
            quantidade: ativo.quantidadeCadastro ?? ativo.quantidade,
            precoMedio: ativo.precoMedioCadastro ?? ativo.precoMedio,
            nota: ativo.nota,
            precoTeto: ativo.precoTeto,
            diaDataCom: ativo.diaDataCom,
            diaPagamento: ativo.diaPagamento,
            segmento: ativo.segmento,
            observacao: ativo.observacao,
            favorito: Boolean(ativo.favorito),
            emWatchlist: Boolean(ativo.emWatchlist)
        })),
        proventos: listaProventos.map((provento) => ({
            ticker: provento.ticker,
            valor: provento.valor,
            mesAno: provento.mesAno
        }))
    };

    baixarArquivo(
        `backup-fii-insight-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(dados, null, 2),
        'application/json;charset=utf-8'
    );
}

export async function importarCarteiraDeArquivo(arquivo) {
    const textoArquivo = await arquivo.text();
    const dados = JSON.parse(textoArquivo);

    return {
        ativos: Array.isArray(dados.ativos) ? dados.ativos : [],
        proventos: Array.isArray(dados.proventos) ? dados.proventos : []
    };
}

export async function restaurarBackupNoFirestore({ db, usuarioAtual, ativos, proventos }) {
    let quantidadeAtivos = 0;
    let quantidadeProventos = 0;

    for (const ativo of ativos) {
        await addDoc(collection(db, 'ativos'), {
            uid: usuarioAtual.uid,
            ...ativo,
            timestamp: serverTimestamp()
        });
        quantidadeAtivos += 1;
    }

    for (const provento of proventos) {
        await addDoc(collection(db, 'proventos'), {
            uid: usuarioAtual.uid,
            ...provento,
            timestamp: serverTimestamp()
        });
        quantidadeProventos += 1;
    }

    return {
        quantidadeAtivos,
        quantidadeProventos
    };
}