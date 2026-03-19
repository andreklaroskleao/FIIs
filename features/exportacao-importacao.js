function baixarArquivo(nomeArquivo, conteudo, tipoMime) {
    const blob = new Blob([conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const elementoLink = document.createElement('a');

    elementoLink.href = url;
    elementoLink.download = nomeArquivo;
    document.body.appendChild(elementoLink);
    elementoLink.click();
    document.body.removeChild(elementoLink);
    URL.revokeObjectURL(url);
}

function removerCamposIndesejadosParaBackup(item) {
    const {
        id,
        valorTotalAtual,
        valorTotalInvestido,
        lucroPrejuizoValor,
        lucroPrejuizoPercentual,
        rendaMensalEstimada,
        rendaAnualEstimada,
        precoAtual,
        origemCalculoPosicao,
        quantidadeCadastro,
        precoMedioCadastro,
        ...dadosRestantes
    } = item || {};

    return dadosRestantes;
}

export function exportarCarteiraParaJson(listaAtivos, listaProventos) {
    const estruturaBackup = {
        exportadoEm: new Date().toISOString(),
        versao: 1,
        ativos: (listaAtivos || []).map(removerCamposIndesejadosParaBackup),
        proventos: (listaProventos || []).map(removerCamposIndesejadosParaBackup)
    };

    baixarArquivo(
        `backup-fii-insight-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(estruturaBackup, null, 2),
        'application/json;charset=utf-8'
    );
}

export async function importarCarteiraDeArquivo(arquivo) {
    if (!arquivo) {
        throw new Error('Arquivo não informado.');
    }

    const conteudoArquivo = await arquivo.text();
    const dadosConvertidos = JSON.parse(conteudoArquivo);

    const ativos = Array.isArray(dadosConvertidos?.ativos) ? dadosConvertidos.ativos : [];
    const proventos = Array.isArray(dadosConvertidos?.proventos) ? dadosConvertidos.proventos : [];

    return {
        ativos,
        proventos
    };
}

export async function restaurarBackupNoFirestore({
    db,
    usuarioAtual,
    ativos,
    proventos
}) {
    if (!db) {
        throw new Error('Banco de dados não disponível.');
    }

    if (!usuarioAtual?.uid) {
        throw new Error('Usuário não autenticado.');
    }

    const moduloFirestore = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { addDoc, collection, serverTimestamp } = moduloFirestore;

    let quantidadeAtivos = 0;
    let quantidadeProventos = 0;

    for (const ativo of ativos || []) {
        await addDoc(collection(db, 'ativos'), {
            ...ativo,
            uid: usuarioAtual.uid,
            timestamp: serverTimestamp()
        });
        quantidadeAtivos += 1;
    }

    for (const provento of proventos || []) {
        await addDoc(collection(db, 'proventos'), {
            ...provento,
            uid: usuarioAtual.uid,
            timestamp: serverTimestamp()
        });
        quantidadeProventos += 1;
    }

    return {
        quantidadeAtivos,
        quantidadeProventos
    };
}