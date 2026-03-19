import {
    db,
    auth,
    provider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from './firebase-config.js';

import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    doc,
    deleteDoc,
    updateDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { estadoAplicacao } from './state/store.js';
import { escaparHtml, normalizarTicker, formatarMesAno, formatarMoeda } from './services/formatadores.js';
import {
    validarDiaDoMes,
    validarDadosAtivo,
    validarDadosProvento,
    limparErrosDosCampos
} from './services/validacoes.js';
import { mostrarNotificacao } from './services/notificacoes.js';
import {
    converterParaNumeroSeguro,
    calcularDistanciaCircularEntreDias,
    enriquecerListaAtivos,
    obterListaAtivosFiltradaEOrdenada
} from './services/calculos-carteira.js';
import { buscarCotacoesNaBrapi } from './services/brapi-service.js';
import { renderizarGraficoProventos, renderizarGraficoSegmentos } from './ui/renderizacao-graficos.js';
import { renderizarHistoricoProventos } from './ui/renderizacao-proventos.js';
import { renderizarTabelaAtivos } from './ui/renderizacao-ativos.js';
import { obterStatusAtivo } from './features/score-oportunidade.js';
import {
    calcularProgressoMetaRenda,
    calcularProgressoMetaPatrimonio
} from './features/metas-carteira.js';
import {
    exportarCarteiraParaJson,
    importarCarteiraDeArquivo
} from './features/exportacao-importacao.js';
import {
    renderizarCardMetaPatrimonio,
    renderizarCardMetaRenda
} from './ui/renderizacao-metas.js';

const elementosInterface = {
    containerNotificacoes: document.getElementById('container-notificacoes'),
    informacoesUsuario: document.getElementById('informacoes-usuario'),
    corpoTabelaAtivos: document.getElementById('corpo-tabela-ativos'),
    corpoTabelaProventos: document.getElementById('corpo-tabela-proventos'),
    textoPatrimonioTotal: document.getElementById('texto-patrimonio-total'),
    textoRendaMensal: document.getElementById('texto-renda-mensal'),
    textoRendaPorHora: document.getElementById('texto-renda-por-hora'),
    textoYieldOnCostMedio: document.getElementById('texto-yield-on-cost-medio'),
    textoQuedaEstimada: document.getElementById('texto-queda-estimada'),
    painelRebalanceamento: document.getElementById('painel-rebalanceamento'),
    campoCaixaDisponivel: document.getElementById('campo-caixa-disponivel'),
    secaoPainel: document.getElementById('secao-painel'),
    secaoProventos: document.getElementById('secao-proventos'),
    graficoProventos: document.getElementById('grafico-proventos'),
    graficoAlocacaoSegmentos: document.getElementById('grafico-alocacao-segmentos'),
    tituloFormularioAtivo: document.getElementById('titulo-formulario-ativo'),
    botaoSalvarAtivo: document.getElementById('botao-salvar-ativo'),
    botaoCancelarEdicaoAtivo: document.getElementById('botao-cancelar-edicao-ativo'),
    tituloFormularioProvento: document.getElementById('titulo-formulario-provento'),
    botaoSalvarProvento: document.getElementById('botao-salvar-provento'),
    botaoCancelarEdicaoProvento: document.getElementById('botao-cancelar-edicao-provento'),
    campoMetaPatrimonio: document.getElementById('campo-meta-patrimonio'),
    campoMetaRendaMensal: document.getElementById('campo-meta-renda-mensal'),
    cardMetaPatrimonio: document.getElementById('card-meta-patrimonio'),
    cardMetaRenda: document.getElementById('card-meta-renda'),
    botaoExportarBackup: document.getElementById('botao-exportar-backup'),
    campoImportarBackup: document.getElementById('campo-importar-backup')
};

const camposFormularioAtivo = {
    ticker: document.getElementById('campo-ticker-ativo'),
    quantidade: document.getElementById('campo-quantidade-ativo'),
    precoMedio: document.getElementById('campo-preco-medio-ativo'),
    nota: document.getElementById('campo-nota-ativo'),
    precoTeto: document.getElementById('campo-preco-teto-ativo'),
    diaDataCom: document.getElementById('campo-dia-data-com'),
    diaPagamento: document.getElementById('campo-dia-pagamento'),
    segmento: document.getElementById('campo-segmento-ativo'),
    observacao: document.getElementById('campo-observacao-ativo')
};

const camposFormularioProvento = {
    ticker: document.getElementById('campo-ticker-provento'),
    valor: document.getElementById('campo-valor-provento'),
    mes: document.getElementById('campo-mes-provento')
};

function atualizarBlocoUsuario(estaLogado) {
    if (estaLogado) {
        elementosInterface.informacoesUsuario.innerHTML = `
            <button id="botao-logout" type="button" class="text-[10px] font-black text-red-500 uppercase px-4 py-2 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition">
                Sair
            </button>
        `;

        document.getElementById('botao-logout').addEventListener('click', async () => {
            try {
                await signOut(auth);
                mostrarNotificacao(elementosInterface.containerNotificacoes, 'Sessão encerrada com sucesso.', 'info');
            } catch (erro) {
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao sair: ${erro.message}`, 'erro');
            }
        });

        return;
    }

    elementosInterface.informacoesUsuario.innerHTML = `
        <button id="botao-login" type="button" class="bg-emerald-600 px-6 py-2 rounded-xl font-black text-[11px] uppercase shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition">
            Login Google
        </button>
    `;

    document.getElementById('botao-login').addEventListener('click', async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, provider);
        } catch (erro) {
            mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro no login: ${erro.message}`, 'erro');
        }
    });
}

function cancelarInscricoesAtivas() {
    if (typeof estadoAplicacao.cancelarInscricaoAtivos === 'function') {
        estadoAplicacao.cancelarInscricaoAtivos();
        estadoAplicacao.cancelarInscricaoAtivos = null;
    }

    if (typeof estadoAplicacao.cancelarInscricaoProventos === 'function') {
        estadoAplicacao.cancelarInscricaoProventos();
        estadoAplicacao.cancelarInscricaoProventos = null;
    }
}

function resetarPainel() {
    estadoAplicacao.listaAtivosEmMemoria = [];
    estadoAplicacao.listaProventosEmMemoria = [];
    estadoAplicacao.mapaLinhasExpandidas = {};

    elementosInterface.textoPatrimonioTotal.textContent = 'R$ 0,00';
    elementosInterface.textoRendaMensal.textContent = 'R$ 0,00';
    elementosInterface.textoRendaPorHora.textContent = 'R$ 0,00 / hora';
    elementosInterface.textoYieldOnCostMedio.textContent = '0.00%';
    elementosInterface.textoQuedaEstimada.textContent = '- R$ 0,00';
    elementosInterface.painelRebalanceamento.innerHTML = '<p class="text-[10px] italic p-4 text-slate-600">Sem dados para rebalanceamento.</p>';
    elementosInterface.corpoTabelaAtivos.innerHTML = '<tr><td colspan="7" class="p-10 text-center text-slate-500 italic">Faça login para carregar seus ativos.</td></tr>';
    elementosInterface.corpoTabelaProventos.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-500 italic">Faça login para ver o histórico.</td></tr>';

    if (estadoAplicacao.instanciaGraficoProventos) {
        estadoAplicacao.instanciaGraficoProventos.destroy();
        estadoAplicacao.instanciaGraficoProventos = null;
    }

    if (estadoAplicacao.instanciaGraficoSegmentos) {
        estadoAplicacao.instanciaGraficoSegmentos.destroy();
        estadoAplicacao.instanciaGraficoSegmentos = null;
    }

    renderizarMetas(0, 0);
}

function renderizarMetas(patrimonioAtual, rendaMensalAtual) {
    const metaPatrimonio = converterParaNumeroSeguro(elementosInterface.campoMetaPatrimonio.value, 0);
    const metaRendaMensal = converterParaNumeroSeguro(elementosInterface.campoMetaRendaMensal.value, 0);

    const progressoMetaPatrimonio = calcularProgressoMetaPatrimonio(patrimonioAtual, metaPatrimonio);
    const progressoMetaRenda = calcularProgressoMetaRenda(rendaMensalAtual, metaRendaMensal);

    renderizarCardMetaPatrimonio(
        elementosInterface.cardMetaPatrimonio,
        progressoMetaPatrimonio,
        patrimonioAtual
    );

    renderizarCardMetaRenda(
        elementosInterface.cardMetaRenda,
        progressoMetaRenda,
        rendaMensalAtual
    );
}

function atualizarResumoPainel(resultadoRenderizacao) {
    elementosInterface.textoPatrimonioTotal.textContent = `R$ ${formatarMoeda(resultadoRenderizacao.patrimonioTotal)}`;
    elementosInterface.textoRendaMensal.textContent = `R$ ${formatarMoeda(resultadoRenderizacao.projecaoMensalTotal)}`;
    elementosInterface.textoRendaPorHora.textContent = `R$ ${formatarMoeda(resultadoRenderizacao.projecaoMensalTotal / 720, 4)} / hora`;
    elementosInterface.textoYieldOnCostMedio.textContent = resultadoRenderizacao.valorTotalInvestidoCarteira > 0
        ? `${((resultadoRenderizacao.projecaoMensalTotal * 12 / resultadoRenderizacao.valorTotalInvestidoCarteira) * 100).toFixed(2)}%`
        : '0.00%';
    elementosInterface.textoQuedaEstimada.textContent = `- R$ ${formatarMoeda(resultadoRenderizacao.patrimonioTotal * 0.05)} (Stress 5%)`;

    elementosInterface.painelRebalanceamento.innerHTML = resultadoRenderizacao.listaSugestoesRebalanceamento
        .sort((sugestaoA, sugestaoB) => sugestaoB.nota - sugestaoA.nota)
        .slice(0, 2)
        .map((sugestao) => {
            return `
                <div class="bg-slate-900/60 p-4 rounded-2xl border border-blue-900/30">
                    <div class="text-[8px] text-blue-400 font-black mb-1 uppercase tracking-widest">Rebalancear</div>
                    <div class="text-lg font-black text-white">${escaparHtml(sugestao.ticker)} <span class="text-emerald-500">+${sugestao.quantidadeSugerida} un.</span></div>
                </div>
            `;
        }).join('') || '<p class="text-[10px] italic p-4 text-slate-600">Alocação equilibrada.</p>';

    renderizarMetas(resultadoRenderizacao.patrimonioTotal, resultadoRenderizacao.projecaoMensalTotal);
}

function renderizarTudo() {
    const resultadoRenderizacao = renderizarTabelaAtivos({
        corpoTabelaAtivos: elementosInterface.corpoTabelaAtivos,
        listaAtivos: estadoAplicacao.listaAtivosEmMemoria,
        listaProventos: estadoAplicacao.listaProventosEmMemoria,
        filtroSegmentoAtual: estadoAplicacao.filtroSegmentoAtual,
        ordenacaoCarteiraAtual: estadoAplicacao.ordenacaoCarteiraAtual,
        caixaDisponivel: converterParaNumeroSeguro(elementosInterface.campoCaixaDisponivel.value, 0),
        mapaLinhasExpandidas: estadoAplicacao.mapaLinhasExpandidas,
        obterListaAtivosFiltradaEOrdenada,
        calcularDistanciaCircularEntreDias,
        obterStatusAtivo
    });

    atualizarResumoPainel(resultadoRenderizacao);

    estadoAplicacao.instanciaGraficoSegmentos = renderizarGraficoSegmentos(
        elementosInterface.graficoAlocacaoSegmentos,
        estadoAplicacao.instanciaGraficoSegmentos,
        estadoAplicacao.listaAtivosEmMemoria
    );
}

function renderizarProventos() {
    renderizarHistoricoProventos(elementosInterface.corpoTabelaProventos, estadoAplicacao.listaProventosEmMemoria);

    const mapaProventosAgrupadosPorMes = {};
    estadoAplicacao.listaProventosEmMemoria.forEach((provento) => {
        mapaProventosAgrupadosPorMes[provento.mesAno] =
            converterParaNumeroSeguro(mapaProventosAgrupadosPorMes[provento.mesAno], 0) + converterParaNumeroSeguro(provento.valor, 0);
    });

    const listaMesesOrdenada = Object.keys(mapaProventosAgrupadosPorMes).sort((mesA, mesB) => mesA.localeCompare(mesB));

    estadoAplicacao.instanciaGraficoProventos = renderizarGraficoProventos(
        elementosInterface.graficoProventos,
        estadoAplicacao.instanciaGraficoProventos,
        listaMesesOrdenada.map(formatarMesAno),
        listaMesesOrdenada.map((mesAno) => mapaProventosAgrupadosPorMes[mesAno])
    );
}

function assinarColecaoAtivos() {
    if (!estadoAplicacao.usuarioAtual) {
        return;
    }

    if (typeof estadoAplicacao.cancelarInscricaoAtivos === 'function') {
        estadoAplicacao.cancelarInscricaoAtivos();
    }

    const consultaAtivos = query(collection(db, 'ativos'), where('uid', '==', estadoAplicacao.usuarioAtual.uid));

    estadoAplicacao.cancelarInscricaoAtivos = onSnapshot(consultaAtivos, async (snapshot) => {
        const listaAtivosBruta = snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data()
        }));

        const mapaCotacoes = await buscarCotacoesNaBrapi(listaAtivosBruta.map((ativo) => ativo.ticker));
        estadoAplicacao.listaAtivosEmMemoria = enriquecerListaAtivos(listaAtivosBruta, mapaCotacoes);
        renderizarTudo();
    }, (erro) => {
        console.error('Erro ao escutar ativos:', erro);
        elementosInterface.corpoTabelaAtivos.innerHTML = '<tr><td colspan="7" class="p-10 text-center text-red-500 italic">Erro ao carregar ativos.</td></tr>';
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Erro ao carregar os ativos.', 'erro');
    });
}

function assinarColecaoProventos() {
    if (!estadoAplicacao.usuarioAtual) {
        return;
    }

    if (typeof estadoAplicacao.cancelarInscricaoProventos === 'function') {
        estadoAplicacao.cancelarInscricaoProventos();
    }

    const consultaProventos = query(collection(db, 'proventos'), where('uid', '==', estadoAplicacao.usuarioAtual.uid));

    estadoAplicacao.cancelarInscricaoProventos = onSnapshot(consultaProventos, (snapshot) => {
        estadoAplicacao.listaProventosEmMemoria = snapshot.docs.map((documento) => ({
            id: documento.id,
            ticker: normalizarTicker(documento.data().ticker),
            valor: converterParaNumeroSeguro(documento.data().valor, 0),
            mesAno: documento.data().mesAno || ''
        }));

        renderizarProventos();
        renderizarTudo();
    }, (erro) => {
        console.error('Erro ao escutar proventos:', erro);
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Erro ao carregar os proventos.', 'erro');
    });
}

function cancelarEdicaoAtivo() {
    estadoAplicacao.identificadorAtivoEmEdicao = null;
    elementosInterface.botaoSalvarAtivo.textContent = 'Salvar no Portfólio';
    elementosInterface.botaoCancelarEdicaoAtivo.classList.add('hidden');
    elementosInterface.tituloFormularioAtivo.innerHTML = '<span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Gerenciar Ativo';

    camposFormularioAtivo.ticker.value = '';
    camposFormularioAtivo.quantidade.value = '';
    camposFormularioAtivo.precoMedio.value = '';
    camposFormularioAtivo.nota.value = '';
    camposFormularioAtivo.precoTeto.value = '';
    camposFormularioAtivo.diaDataCom.value = '';
    camposFormularioAtivo.diaPagamento.value = '';
    camposFormularioAtivo.segmento.value = 'Papel';
    camposFormularioAtivo.observacao.value = '';

    limparErrosDosCampos(Object.values(camposFormularioAtivo));
}

function prepararEdicaoProvento(provento) {
    estadoAplicacao.identificadorProventoEmEdicao = provento.id;
    camposFormularioProvento.ticker.value = provento.ticker;
    camposFormularioProvento.valor.value = provento.valor;
    camposFormularioProvento.mes.value = provento.mesAno;

    elementosInterface.tituloFormularioProvento.textContent = 'Editar Provento';
    elementosInterface.botaoSalvarProvento.textContent = 'Atualizar Provento';
    elementosInterface.botaoCancelarEdicaoProvento.classList.remove('hidden');

    limparErrosDosCampos(Object.values(camposFormularioProvento));
}

function cancelarEdicaoProvento() {
    estadoAplicacao.identificadorProventoEmEdicao = null;
    camposFormularioProvento.ticker.value = '';
    camposFormularioProvento.valor.value = '';
    camposFormularioProvento.mes.value = '';

    elementosInterface.tituloFormularioProvento.textContent = 'Lançar Provento';
    elementosInterface.botaoSalvarProvento.textContent = 'Registrar Provento';
    elementosInterface.botaoCancelarEdicaoProvento.classList.add('hidden');

    limparErrosDosCampos(Object.values(camposFormularioProvento));
}

async function prepararEdicaoAtivo(identificadorAtivo) {
    try {
        const referenciaDocumento = doc(db, 'ativos', identificadorAtivo);
        const documento = await getDoc(referenciaDocumento);

        if (!documento.exists()) {
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo não encontrado para edição.', 'erro');
            return;
        }

        const dadosAtivo = documento.data();

        camposFormularioAtivo.ticker.value = dadosAtivo.ticker || '';
        camposFormularioAtivo.quantidade.value = dadosAtivo.quantidade || '';
        camposFormularioAtivo.precoMedio.value = dadosAtivo.precoMedio || '';
        camposFormularioAtivo.nota.value = dadosAtivo.nota || '';
        camposFormularioAtivo.precoTeto.value = dadosAtivo.precoTeto || '';
        camposFormularioAtivo.diaDataCom.value = dadosAtivo.diaDataCom || '';
        camposFormularioAtivo.diaPagamento.value = dadosAtivo.diaPagamento || '';
        camposFormularioAtivo.segmento.value = dadosAtivo.segmento || 'Outros';
        camposFormularioAtivo.observacao.value = dadosAtivo.observacao || '';

        estadoAplicacao.identificadorAtivoEmEdicao = identificadorAtivo;
        elementosInterface.botaoSalvarAtivo.textContent = 'Atualizar Ativo';
        elementosInterface.botaoCancelarEdicaoAtivo.classList.remove('hidden');
        elementosInterface.tituloFormularioAtivo.innerHTML = '<span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Editando Ativo';

        limparErrosDosCampos(Object.values(camposFormularioAtivo));
    } catch (erro) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao carregar ativo para edição: ${erro.message}`, 'erro');
    }
}

async function salvarAtivo() {
    if (!estadoAplicacao.usuarioAtual) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Faça login primeiro.', 'info');
        return;
    }

    const dadosAtivo = {
        uid: estadoAplicacao.usuarioAtual.uid,
        ticker: normalizarTicker(camposFormularioAtivo.ticker.value),
        quantidade: parseInt(camposFormularioAtivo.quantidade.value, 10),
        precoMedio: converterParaNumeroSeguro(camposFormularioAtivo.precoMedio.value, 0),
        nota: parseInt(camposFormularioAtivo.nota.value, 10),
        precoTeto: converterParaNumeroSeguro(camposFormularioAtivo.precoTeto.value, 0),
        diaDataCom: validarDiaDoMes(camposFormularioAtivo.diaDataCom.value),
        diaPagamento: validarDiaDoMes(camposFormularioAtivo.diaPagamento.value),
        segmento: camposFormularioAtivo.segmento.value || 'Outros',
        observacao: camposFormularioAtivo.observacao.value || '',
        timestamp: serverTimestamp()
    };

    if (!validarDadosAtivo(dadosAtivo, camposFormularioAtivo)) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Revise os campos do ativo.', 'erro');
        return;
    }

    try {
        const ativoDuplicado = estadoAplicacao.listaAtivosEmMemoria.find((ativo) => {
            return ativo.ticker === dadosAtivo.ticker && ativo.id !== estadoAplicacao.identificadorAtivoEmEdicao;
        });

        if (ativoDuplicado) {
            const confirmouContinuacao = confirm('Já existe um ativo com esse ticker. Deseja salvar mesmo assim?');
            if (!confirmouContinuacao) {
                return;
            }
        }

        if (estadoAplicacao.identificadorAtivoEmEdicao) {
            await updateDoc(doc(db, 'ativos', estadoAplicacao.identificadorAtivoEmEdicao), dadosAtivo);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo atualizado com sucesso.', 'sucesso');
        } else {
            await addDoc(collection(db, 'ativos'), dadosAtivo);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo cadastrado com sucesso.', 'sucesso');
        }

        cancelarEdicaoAtivo();
    } catch (erro) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao salvar ativo: ${erro.message}`, 'erro');
    }
}

async function salvarProvento() {
    if (!estadoAplicacao.usuarioAtual) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Faça login primeiro.', 'info');
        return;
    }

    const dadosProvento = {
        uid: estadoAplicacao.usuarioAtual.uid,
        ticker: normalizarTicker(camposFormularioProvento.ticker.value),
        valor: converterParaNumeroSeguro(camposFormularioProvento.valor.value, NaN),
        mesAno: camposFormularioProvento.mes.value,
        timestamp: serverTimestamp()
    };

    if (!validarDadosProvento(dadosProvento, camposFormularioProvento)) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Revise os campos do provento.', 'erro');
        return;
    }

    try {
        if (estadoAplicacao.identificadorProventoEmEdicao) {
            await updateDoc(doc(db, 'proventos', estadoAplicacao.identificadorProventoEmEdicao), dadosProvento);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Provento atualizado com sucesso.', 'sucesso');
        } else {
            await addDoc(collection(db, 'proventos'), dadosProvento);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Provento registrado com sucesso.', 'sucesso');
        }

        cancelarEdicaoProvento();
    } catch (erro) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao salvar provento: ${erro.message}`, 'erro');
    }
}

function abrirFormularioProventoComTickerPreenchido(ticker) {
    document.querySelector('[data-aba="proventos"]').click();
    camposFormularioProvento.ticker.value = ticker;
    camposFormularioProvento.valor.focus();
    mostrarNotificacao(elementosInterface.containerNotificacoes, `Ticker ${ticker} enviado para o formulário de proventos.`, 'info');
}

function inicializarEventosDaInterface() {
    document.getElementById('botao-modo-privacidade').addEventListener('click', () => {
        estadoAplicacao.modoPrivacidadeAtivo = !estadoAplicacao.modoPrivacidadeAtivo;
        document.body.classList.toggle('modo-privacidade', estadoAplicacao.modoPrivacidadeAtivo);
        document.getElementById('icone-modo-privacidade').innerText = estadoAplicacao.modoPrivacidadeAtivo ? '🙈' : '👁️';
    });

    document.getElementById('container-filtros-segmento').addEventListener('click', (evento) => {
        const botaoFiltro = evento.target.closest('.botao-filtro');
        if (!botaoFiltro) {
            return;
        }

        estadoAplicacao.filtroSegmentoAtual = botaoFiltro.dataset.filtro;

        document.querySelectorAll('.botao-filtro').forEach((botao) => {
            botao.classList.toggle('ativo', botao.dataset.filtro === estadoAplicacao.filtroSegmentoAtual);
        });

        renderizarTudo();
    });

    document.getElementById('container-ordenacao-carteira').addEventListener('click', (evento) => {
        const botaoOrdenacao = evento.target.closest('.botao-ordenacao');
        if (!botaoOrdenacao) {
            return;
        }

        estadoAplicacao.ordenacaoCarteiraAtual = botaoOrdenacao.dataset.ordenacao;

        document.querySelectorAll('.botao-ordenacao').forEach((botao) => {
            botao.classList.toggle('ativo', botao.dataset.ordenacao === estadoAplicacao.ordenacaoCarteiraAtual);
        });

        renderizarTudo();
    });

    document.getElementById('navegacao-abas').addEventListener('click', (evento) => {
        const botaoAba = evento.target.closest('button[data-aba]');
        if (!botaoAba) {
            return;
        }

        const abaSelecionada = botaoAba.dataset.aba;

        elementosInterface.secaoPainel.classList.toggle('hidden', abaSelecionada !== 'painel');
        elementosInterface.secaoProventos.classList.toggle('hidden', abaSelecionada !== 'proventos');

        document.querySelectorAll('#navegacao-abas button').forEach((botao) => {
            botao.classList.toggle('text-white', botao.dataset.aba === abaSelecionada);
            botao.classList.toggle('aba-ativa', botao.dataset.aba === abaSelecionada);
        });
    });

    elementosInterface.campoCaixaDisponivel.addEventListener('input', renderizarTudo);
    elementosInterface.botaoSalvarAtivo.addEventListener('click', salvarAtivo);
    elementosInterface.botaoCancelarEdicaoAtivo.addEventListener('click', cancelarEdicaoAtivo);
    elementosInterface.botaoSalvarProvento.addEventListener('click', salvarProvento);
    elementosInterface.botaoCancelarEdicaoProvento.addEventListener('click', cancelarEdicaoProvento);

    elementosInterface.campoMetaPatrimonio.addEventListener('input', () => {
        renderizarTudo();
    });

    elementosInterface.campoMetaRendaMensal.addEventListener('input', () => {
        renderizarTudo();
    });

    elementosInterface.botaoExportarBackup.addEventListener('click', () => {
        exportarCarteiraParaJson(
            estadoAplicacao.listaAtivosEmMemoria,
            estadoAplicacao.listaProventosEmMemoria
        );

        mostrarNotificacao(
            elementosInterface.containerNotificacoes,
            'Backup exportado com sucesso.',
            'sucesso'
        );
    });

    elementosInterface.campoImportarBackup.addEventListener('change', async (evento) => {
        const arquivo = evento.target.files?.[0];
        if (!arquivo) {
            return;
        }

        try {
            const dadosImportados = await importarCarteiraDeArquivo(arquivo);

            mostrarNotificacao(
                elementosInterface.containerNotificacoes,
                `Backup lido com sucesso. Ativos: ${dadosImportados.ativos.length}, Proventos: ${dadosImportados.proventos.length}.`,
                'sucesso'
            );

            console.log('Dados importados:', dadosImportados);
        } catch (erro) {
            mostrarNotificacao(
                elementosInterface.containerNotificacoes,
                `Erro ao importar backup: ${erro.message}`,
                'erro'
            );
        } finally {
            evento.target.value = '';
        }
    });

    elementosInterface.corpoTabelaAtivos.addEventListener('click', async (evento) => {
        const botaoEditarAtivo = evento.target.closest('.botao-editar-ativo');
        const botaoExcluirAtivo = evento.target.closest('.botao-excluir-ativo');
        const botaoDetalhesAtivo = evento.target.closest('.botao-detalhes-ativo');
        const botaoRegistrarProvento = evento.target.closest('.botao-registrar-provento');

        if (botaoEditarAtivo) {
            await prepararEdicaoAtivo(botaoEditarAtivo.dataset.id);
        }

        if (botaoExcluirAtivo) {
            const confirmouExclusao = confirm('Deseja realmente excluir este ativo?');
            if (!confirmouExclusao) {
                return;
            }

            try {
                await deleteDoc(doc(db, 'ativos', botaoExcluirAtivo.dataset.id));

                if (estadoAplicacao.identificadorAtivoEmEdicao === botaoExcluirAtivo.dataset.id) {
                    cancelarEdicaoAtivo();
                }

                mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo excluído com sucesso.', 'sucesso');
            } catch (erro) {
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao excluir ativo: ${erro.message}`, 'erro');
            }
        }

        if (botaoDetalhesAtivo) {
            const identificadorAtivo = botaoDetalhesAtivo.dataset.id;
            estadoAplicacao.mapaLinhasExpandidas[identificadorAtivo] = !estadoAplicacao.mapaLinhasExpandidas[identificadorAtivo];
            renderizarTudo();
        }

        if (botaoRegistrarProvento) {
            abrirFormularioProventoComTickerPreenchido(botaoRegistrarProvento.dataset.ticker);
        }
    });

    elementosInterface.corpoTabelaAtivos.addEventListener('input', (evento) => {
        const campoSimulacaoAporte = evento.target.closest('.campo-simulacao-aporte');
        if (!campoSimulacaoAporte) {
            return;
        }

        const identificadorAtivo = campoSimulacaoAporte.dataset.id;
        const ativo = estadoAplicacao.listaAtivosEmMemoria.find((item) => item.id === identificadorAtivo);
        if (!ativo) {
            return;
        }

        ativo.valorSimulacaoAporte = converterParaNumeroSeguro(campoSimulacaoAporte.value, 0);
        renderizarTudo();
    });

    elementosInterface.corpoTabelaProventos.addEventListener('click', async (evento) => {
        const botaoEditarProvento = evento.target.closest('.botao-editar-provento');
        const botaoExcluirProvento = evento.target.closest('.botao-excluir-provento');

        if (botaoEditarProvento) {
            const proventoSelecionado = estadoAplicacao.listaProventosEmMemoria.find((provento) => provento.id === botaoEditarProvento.dataset.id);
            if (proventoSelecionado) {
                prepararEdicaoProvento(proventoSelecionado);
            }
        }

        if (botaoExcluirProvento) {
            const confirmouExclusao = confirm('Deseja realmente excluir este provento?');
            if (!confirmouExclusao) {
                return;
            }

            try {
                await deleteDoc(doc(db, 'proventos', botaoExcluirProvento.dataset.id));

                if (estadoAplicacao.identificadorProventoEmEdicao === botaoExcluirProvento.dataset.id) {
                    cancelarEdicaoProvento();
                }

                mostrarNotificacao(elementosInterface.containerNotificacoes, 'Provento excluído com sucesso.', 'sucesso');
            } catch (erro) {
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao excluir provento: ${erro.message}`, 'erro');
            }
        }
    });

    Object.values(camposFormularioAtivo).forEach((campo) => {
        campo.addEventListener('input', () => limparErrosDosCampos(Object.values(camposFormularioAtivo)));
    });

    Object.values(camposFormularioProvento).forEach((campo) => {
        campo.addEventListener('input', () => limparErrosDosCampos(Object.values(camposFormularioProvento)));
    });
}

inicializarEventosDaInterface();

onAuthStateChanged(auth, (usuario) => {
    cancelarInscricoesAtivas();

    if (usuario) {
        estadoAplicacao.usuarioAtual = usuario;
        resetarPainel();
        atualizarBlocoUsuario(true);
        assinarColecaoAtivos();
        assinarColecaoProventos();
        return;
    }

    estadoAplicacao.usuarioAtual = null;
    cancelarEdicaoAtivo();
    cancelarEdicaoProvento();
    atualizarBlocoUsuario(false);
    resetarPainel();
});
