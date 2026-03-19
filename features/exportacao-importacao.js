import {
    collection,
    addDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export function exportarCarteiraParaJson(listaAtivos, listaProventos, nomeArquivo = 'backup-carteira.json') {
    const conteudo = {
        versao: 1,
        exportadoEm: new Date().toISOString(),
        ativos: listaAtivos.map((ativo) => ({
            ticker: ativo.ticker,
            quantidade: ativo.quantidade,
            precoMedio: ativo.precoMedio,
            nota: ativo.nota,
            precoTeto: ativo.precoTeto,
            diaDataCom: ativo.diaDataCom,
            diaPagamento: ativo.diaPagamento,
            segmento: ativo.segmento,
            observacao: ativo.observacao || ''
        })),
        proventos: listaProventos.map((provento) => ({
            ticker: provento.ticker,
            valor: provento.valor,
            mesAno: provento.mesAno
        }))
    };

    const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
}

export async function importarCarteiraDeArquivo(arquivo) {
    const texto = await arquivo.text();
    const dados = JSON.parse(texto);

    return {
        ativos: Array.isArray(dados.ativos) ? dados.ativos : [],
        proventos: Array.isArray(dados.proventos) ? dados.proventos : []
    };
}

export async function restaurarBackupNoFirestore({
    db,
    usuarioAtual,
    ativos,
    proventos
}) {
    if (!usuarioAtual) {
        throw new Error('Usuário não autenticado.');
    }

    const promessasAtivos = ativos.map((ativo) => {
        return addDoc(collection(db, 'ativos'), {
            uid: usuarioAtual.uid,
            ticker: ativo.ticker || '',
            quantidade: Number(ativo.quantidade || 0),
            precoMedio: Number(ativo.precoMedio || 0),
            nota: Number(ativo.nota || 0),
            precoTeto: Number(ativo.precoTeto || 0),
            diaDataCom: ativo.diaDataCom ?? null,
            diaPagamento: ativo.diaPagamento ?? null,
            segmento: ativo.segmento || 'Outros',
            observacao: ativo.observacao || '',
            timestamp: serverTimestamp()
        });
    });

    const promessasProventos = proventos.map((provento) => {
        return addDoc(collection(db, 'proventos'), {
            uid: usuarioAtual.uid,
            ticker: provento.ticker || '',
            valor: Number(provento.valor || 0),
            mesAno: provento.mesAno || '',
            timestamp: serverTimestamp()
        });
    });

    await Promise.all([...promessasAtivos, ...promessasProventos]);

    return {
        quantidadeAtivos: ativos.length,
        quantidadeProventos: proventos.length
    };
}
