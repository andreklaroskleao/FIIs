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
import { validarDiaDoMes, validarDadosAtivo, validarDadosProvento, limparErrosDosCampos } from './services/validacoes.js';
import { mostrarNotificacao } from './services/notificacoes.js';
import {
    converterParaNumeroSeguro,
    calcularDistanciaCircularEntreDias,
    enriquecerListaAtivos,
    obterListaAtivosFiltradaEOrdenada,
    gerarListaAlertas,
    gerarSimulacaoGlobalDeAporte
} from './services/calculos-carteira.js';
import { buscarCotacoesNaBrapi } from './services/brapi-service.js';
import { renderizarGraficoProventos, renderizarGraficoSegmentos } from './ui/renderizacao-graficos.js';
import { renderizarHistoricoProventos } from './ui/renderizacao-proventos.js';
import { renderizarTabelaAtivos } from './ui/renderizacao-ativos.js';
import { renderizarCardsMobileAtivos } from './ui/renderizacao-cards-mobile.js';
import { renderizarPainelHistoricoAportes } from './ui/renderizacao-aportes.js';
import { obterStatusAtivo, gerarRankingDeOportunidades } from './features/score-oportunidade.js';
import { calcularProgressoMetaRenda, calcularProgressoMetaPatrimonio } from './features/metas-carteira.js';
import { exportarCarteiraParaJson, importarCarteiraDeArquivo, restaurarBackupNoFirestore } from './features/exportacao-importacao.js';
import { renderizarCardMetaPatrimonio, renderizarCardMetaRenda } from './ui/renderizacao-metas.js';
import { renderizarPainelWatchlist } from './ui/renderizacao-watchlist.js';
import { renderizarPainelComparador } from './ui/renderizacao-comparador.js';
import { renderizarPainelFavoritos } from './ui/renderizacao-favoritos.js';
import { renderizarPainelRankingOportunidades } from './ui/renderizacao-ranking.js';
import { renderizarPainelAlertas } from './ui/renderizacao-alertas.js';
import { renderizarPainelSimuladorGlobal } from './ui/renderizacao-simulador-global.js';
import { renderizarPainelCalendarioCarteira } from './ui/renderizacao-calendario.js';
import { gerarConteudoRelatorioCarteira, exportarRelatorioCarteiraComoTxt } from './features/exportacao-relatorio.js';
import { montarDadosAporte, salvarAporteNoFirestore, excluirAporteNoFirestore } from './features/aportes-carteira.js';

const CHAVE_LOCAL_STORAGE_META_PATRIMONIO = 'fii_insight_meta_patrimonio';
const CHAVE_LOCAL_STORAGE_META_RENDA_MENSAL = 'fii_insight_meta_renda_mensal';
const CHAVE_LOCAL_STORAGE_FILTRO_SEGMENTO = 'fii_insight_filtro_segmento';
const CHAVE_LOCAL_STORAGE_FILTRO_INTELIGENTE = 'fii_insight_filtro_inteligente';
const CHAVE_LOCAL_STORAGE_ORDENACAO = 'fii_insight_ordenacao';
const CHAVE_LOCAL_STORAGE_COMPARADOR = 'fii_insight_comparador';
const CHAVE_LOCAL_STORAGE_MODO_PRIVACIDADE = 'fii_insight_modo_privacidade';
const CHAVE_LOCAL_STORAGE_OBSERVACOES_WATCHLIST = 'fii_insight_observacoes_watchlist';
const CHAVE_LOCAL_STORAGE_APORTE_GLOBAL = 'fii_insight_aporte_global';
const CHAVE_LOCAL_STORAGE_ABA_PRINCIPAL = 'fii_insight_aba_principal';
const CHAVE_LOCAL_STORAGE_SUBABA_CARTEIRA = 'fii_insight_subaba_carteira';
const CHAVE_LOCAL_STORAGE_SUBABA_APORTES = 'fii_insight_subaba_aportes';
const CHAVE_LOCAL_STORAGE_SUBABA_ANALISES = 'fii_insight_subaba_analises';
const CHAVE_LOCAL_STORAGE_MENU_RECOLHIDO = 'fii_insight_menu_recolhido';

const elementosInterface = {
    containerNotificacoes: document.getElementById('container-notificacoes'),
    informacoesUsuario: document.getElementById('informacoes-usuario'),

    menuSuperior: document.getElementById('menu-superior'),
    botaoAlternarMenu: document.getElementById('botao-alternar-menu'),

    corpoTabelaAtivos: document.getElementById('corpo-tabela-ativos'),
    listaCardsMobileAtivos: document.getElementById('lista-cards-mobile-ativos'),
    corpoTabelaProventos: document.getElementById('corpo-tabela-proventos'),
    painelHistoricoAportes: document.getElementById('painel-historico-aportes'),

    textoPatrimonioTotal: document.getElementById('texto-patrimonio-total'),
    textoRendaMensal: document.getElementById('texto-renda-mensal'),
    textoRendaPorHora: document.getElementById('texto-renda-por-hora'),
    textoYieldOnCostMedio: document.getElementById('texto-yield-on-cost-medio'),
    textoQuedaEstimada: document.getElementById('texto-queda-estimada'),

    painelRebalanceamento: document.getElementById('painel-rebalanceamento'),
    painelWatchlist: document.getElementById('painel-watchlist'),
    painelComparador: document.getElementById('painel-comparador'),
    painelFavoritos: document.getElementById('painel-favoritos'),
    painelRankingOportunidades: document.getElementById('painel-ranking-oportunidades'),
    painelAlertas: document.getElementById('painel-alertas'),
    painelSimuladorGlobal: document.getElementById('painel-simulador-global'),
    painelCalendarioCarteira: document.getElementById('painel-calendario-carteira'),

    campoValorAporteGlobal: document.getElementById('campo-valor-aporte-global'),
    campoCaixaDisponivel: document.getElementById('campo-caixa-disponivel'),

    botaoExportarRelatorio: document.getElementById('botao-exportar-relatorio'),
    botaoLimparComparador: document.getElementById('botao-limpar-comparador'),

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
    campoImportarBackup: document.getElementById('campo-importar-backup'),

    iconeModoPrivacidade: document.getElementById('icone-modo-privacidade'),
    botaoModoPrivacidade: document.getElementById('botao-modo-privacidade'),

    campoTickerAporte: document.getElementById('campo-ticker-aporte'),
    campoQuantidadeAporte: document.getElementById('campo-quantidade-aporte'),
    campoPrecoAporte: document.getElementById('campo-preco-aporte'),
    campoDataAporte: document.getElementById('campo-data-aporte'),
    campoObservacaoAporte: document.getElementById('campo-observacao-aporte'),
    botaoSalvarAporte: document.getElementById('botao-salvar-aporte'),
    botaoCancelarEdicaoAporte: document.getElementById('botao-cancelar-edicao-aporte'),

    containerFiltrosSegmento: document.getElementById('container-filtros-segmento'),
    containerFiltrosInteligentes: document.getElementById('container-filtros-inteligentes'),
    containerOrdenacaoCarteira: document.getElementById('container-ordenacao-carteira'),

    navegacaoAbasPrincipais: document.getElementById('navegacao-abas-principais'),
    navegacaoSubabasCarteira: document.getElementById('navegacao-subabas-carteira'),
    navegacaoSubabasAportes: document.getElementById('navegacao-subabas-aportes'),
    navegacaoSubabasAnalises: document.getElementById('navegacao-subabas-analises'),

    secaoVisaoGeral: document.getElementById('secao-visao-geral'),
    secaoCarteira: document.getElementById('secao-carteira'),
    secaoAportes: document.getElementById('secao-aportes'),
    secaoProventos: document.getElementById('secao-proventos'),
    secaoAnalises: document.getElementById('secao-analises'),
    secaoListas: document.getElementById('secao-listas'),
    secaoConfiguracoes: document.getElementById('secao-configuracoes'),

    subabaCarteiraGestao: document.getElementById('subaba-carteira-gestao'),
    subabaCarteiraLista: document.getElementById('subaba-carteira-lista'),
    subabaAportesRegistrar: document.getElementById('subaba-aportes-registrar'),
    subabaAportesHistorico: document.getElementById('subaba-aportes-historico'),
    subabaAnalisesSimulador: document.getElementById('subaba-analises-simulador'),
    subabaAnalisesComparador: document.getElementById('subaba-analises-comparador'),
    subabaAnalisesRanking: document.getElementById('subaba-analises-ranking'),

    botaoAcaoRapidaNovoAtivo: document.getElementById('botao-acao-rapida-novo-ativo'),
    botaoAcaoRapidaNovoAporte: document.getElementById('botao-acao-rapida-novo-aporte'),
    botaoAcaoRapidaNovoProvento: document.getElementById('botao-acao-rapida-novo-provento'),
    botaoAcaoRapidaComparador: document.getElementById('botao-acao-rapida-comparador'),
    botaoAcaoRapidaBackup: document.getElementById('botao-acao-rapida-backup'),

    contadorAbaVisaoGeral: document.getElementById('contador-aba-visao-geral'),
    contadorAbaCarteira: document.getElementById('contador-aba-carteira'),
    contadorAbaAportes: document.getElementById('contador-aba-aportes'),
    contadorAbaProventos: document.getElementById('contador-aba-proventos'),
    contadorAbaAnalises: document.getElementById('contador-aba-analises'),
    contadorAbaListas: document.getElementById('contador-aba-listas'),
    contadorAbaConfiguracoes: document.getElementById('contador-aba-configuracoes')
};

const camposFormularioAtivo = {
    ticker: document.getElementById('campo-ticker-ativo'),
    quantidade: document.getElementById('campo-quantidade-ativo'),
    precoMedio: document.getElementById('campo-preco-medio-ativo'),
    nota: document.getElementById('campo-nota-ativo'),
    precoTeto: document.getElementById('campo-preco-teto-ativo'),
    precoAtualManual: document.getElementById('campo-preco-atual-manual-ativo'),
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

function adicionarEventoSeElementoExistir(elemento, nomeEvento, manipulador) {
    if (!elemento) {
        return;
    }

    elemento.addEventListener(nomeEvento, manipulador);
}

function salvarModoPrivacidadeNoLocalStorage() {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_MODO_PRIVACIDADE, estadoAplicacao.modoPrivacidadeAtivo ? '1' : '0');
}

function carregarModoPrivacidadeDoLocalStorage() {
    const valorSalvo = localStorage.getItem(CHAVE_LOCAL_STORAGE_MODO_PRIVACIDADE);
    estadoAplicacao.modoPrivacidadeAtivo = valorSalvo === '1';
    document.body.classList.toggle('modo-privacidade', estadoAplicacao.modoPrivacidadeAtivo);

    if (elementosInterface.iconeModoPrivacidade) {
        elementosInterface.iconeModoPrivacidade.innerText = estadoAplicacao.modoPrivacidadeAtivo ? '🙈' : '👁️';
    }
}

function salvarEstadoMenuNoLocalStorage(menuRecolhido) {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_MENU_RECOLHIDO, menuRecolhido ? '1' : '0');
}

function carregarEstadoMenuDoLocalStorage() {
    const menuRecolhido = localStorage.getItem(CHAVE_LOCAL_STORAGE_MENU_RECOLHIDO) === '1';
    aplicarEstadoVisualDoMenu(menuRecolhido);
}

function aplicarEstadoVisualDoMenu(menuRecolhido) {
    if (elementosInterface.menuSuperior) {
        elementosInterface.menuSuperior.classList.toggle('menu-recolhido', menuRecolhido);
    }

    if (elementosInterface.botaoAlternarMenu) {
        elementosInterface.botaoAlternarMenu.textContent = menuRecolhido ? 'Mostrar menu' : 'Ocultar menu';
    }
}

function alternarMenuSuperior() {
    const estaRecolhido = elementosInterface.menuSuperior?.classList.contains('menu-recolhido');
    const proximoEstado = !estaRecolhido;
    aplicarEstadoVisualDoMenu(proximoEstado);
    salvarEstadoMenuNoLocalStorage(proximoEstado);
}

function salvarMetasNoLocalStorage() {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_META_PATRIMONIO, String(elementosInterface.campoMetaPatrimonio?.value || ''));
    localStorage.setItem(CHAVE_LOCAL_STORAGE_META_RENDA_MENSAL, String(elementosInterface.campoMetaRendaMensal?.value || ''));
}

function carregarMetasDoLocalStorage() {
    const metaPatrimonioSalva = localStorage.getItem(CHAVE_LOCAL_STORAGE_META_PATRIMONIO);
    const metaRendaMensalSalva = localStorage.getItem(CHAVE_LOCAL_STORAGE_META_RENDA_MENSAL);

    if (metaPatrimonioSalva !== null && elementosInterface.campoMetaPatrimonio) {
        elementosInterface.campoMetaPatrimonio.value = metaPatrimonioSalva;
    }

    if (metaRendaMensalSalva !== null && elementosInterface.campoMetaRendaMensal) {
        elementosInterface.campoMetaRendaMensal.value = metaRendaMensalSalva;
    }
}

function salvarFiltroEOrdenacaoNoLocalStorage() {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_FILTRO_SEGMENTO, estadoAplicacao.filtroSegmentoAtual);
    localStorage.setItem(CHAVE_LOCAL_STORAGE_FILTRO_INTELIGENTE, estadoAplicacao.filtroInteligenteAtual);
    localStorage.setItem(CHAVE_LOCAL_STORAGE_ORDENACAO, estadoAplicacao.ordenacaoCarteiraAtual);
}

function carregarFiltroEOrdenacaoDoLocalStorage() {
    const filtroSalvo = localStorage.getItem(CHAVE_LOCAL_STORAGE_FILTRO_SEGMENTO);
    const filtroInteligenteSalvo = localStorage.getItem(CHAVE_LOCAL_STORAGE_FILTRO_INTELIGENTE);
    const ordenacaoSalva = localStorage.getItem(CHAVE_LOCAL_STORAGE_ORDENACAO);

    if (filtroSalvo) {
        estadoAplicacao.filtroSegmentoAtual = filtroSalvo;
    }

    if (filtroInteligenteSalvo) {
        estadoAplicacao.filtroInteligenteAtual = filtroInteligenteSalvo;
    }

    if (ordenacaoSalva) {
        estadoAplicacao.ordenacaoCarteiraAtual = ordenacaoSalva;
    }

    document.querySelectorAll('.botao-filtro').forEach((botao) => {
        botao.classList.toggle('ativo', botao.dataset.filtro === estadoAplicacao.filtroSegmentoAtual);
    });

    document.querySelectorAll('.botao-filtro-inteligente').forEach((botao) => {
        botao.classList.toggle('ativo', botao.dataset.filtroInteligente === estadoAplicacao.filtroInteligenteAtual);
    });

    document.querySelectorAll('.botao-ordenacao').forEach((botao) => {
        botao.classList.toggle('ativo', botao.dataset.ordenacao === estadoAplicacao.ordenacaoCarteiraAtual);
    });
}

function salvarComparadorNoLocalStorage() {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_COMPARADOR, JSON.stringify(estadoAplicacao.listaAtivosSelecionadosParaComparacao || []));
}

function carregarComparadorDoLocalStorage() {
    const comparadorSalvo = localStorage.getItem(CHAVE_LOCAL_STORAGE_COMPARADOR);

    if (!comparadorSalvo) {
        estadoAplicacao.listaAtivosSelecionadosParaComparacao = [];
        return;
    }

    try {
        const listaConvertida = JSON.parse(comparadorSalvo);
        estadoAplicacao.listaAtivosSelecionadosParaComparacao = Array.isArray(listaConvertida) ? listaConvertida.slice(0, 2) : [];
    } catch {
        estadoAplicacao.listaAtivosSelecionadosParaComparacao = [];
    }
}

function salvarObservacoesWatchlistNoLocalStorage() {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_OBSERVACOES_WATCHLIST, JSON.stringify(estadoAplicacao.mapaObservacoesWatchlist || {}));
}

function carregarObservacoesWatchlistDoLocalStorage() {
    const observacoesSalvas = localStorage.getItem(CHAVE_LOCAL_STORAGE_OBSERVACOES_WATCHLIST);

    if (!observacoesSalvas) {
        estadoAplicacao.mapaObservacoesWatchlist = {};
        return;
    }

    try {
        const objetoConvertido = JSON.parse(observacoesSalvas);
        estadoAplicacao.mapaObservacoesWatchlist = typeof objetoConvertido === 'object' && objetoConvertido !== null ? objetoConvertido : {};
    } catch {
        estadoAplicacao.mapaObservacoesWatchlist = {};
    }
}

function salvarAporteGlobalNoLocalStorage() {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_APORTE_GLOBAL, String(elementosInterface.campoValorAporteGlobal?.value || ''));
}

function carregarAporteGlobalNoLocalStorage() {
    const valorSalvo = localStorage.getItem(CHAVE_LOCAL_STORAGE_APORTE_GLOBAL);

    if (valorSalvo !== null && elementosInterface.campoValorAporteGlobal) {
        elementosInterface.campoValorAporteGlobal.value = valorSalvo;
    }
}

function salvarAbaPrincipalNoLocalStorage(abaSelecionada) {
    localStorage.setItem(CHAVE_LOCAL_STORAGE_ABA_PRINCIPAL, abaSelecionada);
}

function carregarAbaPrincipalDoLocalStorage() {
    return localStorage.getItem(CHAVE_LOCAL_STORAGE_ABA_PRINCIPAL) || 'visao-geral';
}

function salvarSubabaNoLocalStorage(grupo, subabaSelecionada) {
    if (grupo === 'carteira') {
        localStorage.setItem(CHAVE_LOCAL_STORAGE_SUBABA_CARTEIRA, subabaSelecionada);
    }

    if (grupo === 'aportes') {
        localStorage.setItem(CHAVE_LOCAL_STORAGE_SUBABA_APORTES, subabaSelecionada);
    }

    if (grupo === 'analises') {
        localStorage.setItem(CHAVE_LOCAL_STORAGE_SUBABA_ANALISES, subabaSelecionada);
    }
}

function carregarSubabaDoLocalStorage(grupo) {
    if (grupo === 'carteira') {
        return localStorage.getItem(CHAVE_LOCAL_STORAGE_SUBABA_CARTEIRA) || 'gestao';
    }

    if (grupo === 'aportes') {
        return localStorage.getItem(CHAVE_LOCAL_STORAGE_SUBABA_APORTES) || 'registrar';
    }

    if (grupo === 'analises') {
        return localStorage.getItem(CHAVE_LOCAL_STORAGE_SUBABA_ANALISES) || 'simulador';
    }

    return '';
}

function alternarAbaPrincipal(abaSelecionada) {
    const mapaSecoes = {
        'visao-geral': elementosInterface.secaoVisaoGeral,
        'carteira': elementosInterface.secaoCarteira,
        'aportes': elementosInterface.secaoAportes,
        'proventos': elementosInterface.secaoProventos,
        'analises': elementosInterface.secaoAnalises,
        'listas': elementosInterface.secaoListas,
        'configuracoes': elementosInterface.secaoConfiguracoes
    };

    Object.entries(mapaSecoes).forEach(([nomeAba, secao]) => {
        if (!secao) {
            return;
        }

        secao.classList.toggle('hidden', nomeAba !== abaSelecionada);
    });

    document.querySelectorAll('.botao-aba-principal').forEach((botao) => {
        botao.classList.toggle('ativa', botao.dataset.abaPrincipal === abaSelecionada);
    });

    salvarAbaPrincipalNoLocalStorage(abaSelecionada);
}

function alternarSubaba(grupo, subabaSelecionada) {
    const mapaSubabas = {
        carteira: {
            secoes: {
                gestao: elementosInterface.subabaCarteiraGestao,
                lista: elementosInterface.subabaCarteiraLista
            },
            seletorBotoes: '[data-subaba-grupo="carteira"]'
        },
        aportes: {
            secoes: {
                registrar: elementosInterface.subabaAportesRegistrar,
                historico: elementosInterface.subabaAportesHistorico
            },
            seletorBotoes: '[data-subaba-grupo="aportes"]'
        },
        analises: {
            secoes: {
                simulador: elementosInterface.subabaAnalisesSimulador,
                comparador: elementosInterface.subabaAnalisesComparador,
                ranking: elementosInterface.subabaAnalisesRanking
            },
            seletorBotoes: '[data-subaba-grupo="analises"]'
        }
    };

    const configuracaoGrupo = mapaSubabas[grupo];

    if (!configuracaoGrupo) {
        return;
    }

    Object.entries(configuracaoGrupo.secoes).forEach(([nomeSubaba, secao]) => {
        if (!secao) {
            return;
        }

        secao.classList.toggle('hidden', nomeSubaba !== subabaSelecionada);
    });

    document.querySelectorAll(configuracaoGrupo.seletorBotoes).forEach((botao) => {
        botao.classList.toggle('ativa', botao.dataset.subaba === subabaSelecionada);
    });

    salvarSubabaNoLocalStorage(grupo, subabaSelecionada);
}

function vincularBotaoLoginAtual() {
    const botaoLoginPadrao = document.getElementById('botao-login-html');
    const botaoLoginRenderizado = document.getElementById('botao-login');
    const botaoAlvo = botaoLoginRenderizado || botaoLoginPadrao;

    if (!botaoAlvo) {
        return;
    }

    if (botaoAlvo.dataset.loginVinculado === '1') {
        return;
    }

    botaoAlvo.dataset.loginVinculado = '1';

    botaoAlvo.addEventListener('click', async () => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, provider);
        } catch (erro) {
            console.error('Erro no login:', erro);
            mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro no login: ${erro.message}`, 'erro');
        }
    });
}

function atualizarBlocoUsuario(estaLogado) {
    if (!elementosInterface.informacoesUsuario) {
        return;
    }

    if (estaLogado) {
        elementosInterface.informacoesUsuario.innerHTML = `
            <button id="botao-logout" type="button" class="text-[10px] font-black text-red-500 uppercase px-4 py-2 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition">
                Sair
            </button>
        `;

        const botaoLogout = document.getElementById('botao-logout');

        if (botaoLogout) {
            botaoLogout.addEventListener('click', async () => {
                try {
                    await signOut(auth);
                    mostrarNotificacao(elementosInterface.containerNotificacoes, 'Sessão encerrada com sucesso.', 'info');
                } catch (erro) {
                    console.error('Erro ao sair:', erro);
                    mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao sair: ${erro.message}`, 'erro');
                }
            });
        }

        return;
    }

    elementosInterface.informacoesUsuario.innerHTML = `
        <button id="botao-login" type="button" class="bg-emerald-600 px-6 py-2 rounded-xl font-black text-[11px] uppercase shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 transition">
            Login Google
        </button>
    `;

    vincularBotaoLoginAtual();
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

    if (typeof estadoAplicacao.cancelarInscricaoAportes === 'function') {
        estadoAplicacao.cancelarInscricaoAportes();
        estadoAplicacao.cancelarInscricaoAportes = null;
    }
}

function gerarEventosCalendarioCarteira(listaAtivos) {
    const diaAtual = new Date().getDate();
    const listaEventosCalendario = [];

    listaAtivos.forEach((ativo) => {
        if (ativo.diaDataCom) {
            listaEventosCalendario.push({
                id: `${ativo.id}-data-com`,
                ticker: ativo.ticker,
                segmento: ativo.segmento,
                tipo: 'Data com',
                dia: ativo.diaDataCom,
                distanciaDias: calcularDistanciaCircularEntreDias(ativo.diaDataCom, diaAtual)
            });
        }

        if (ativo.diaPagamento) {
            listaEventosCalendario.push({
                id: `${ativo.id}-pagamento`,
                ticker: ativo.ticker,
                segmento: ativo.segmento,
                tipo: 'Pagamento',
                dia: ativo.diaPagamento,
                distanciaDias: calcularDistanciaCircularEntreDias(ativo.diaPagamento, diaAtual)
            });
        }
    });

    return listaEventosCalendario.sort((eventoA, eventoB) => eventoA.distanciaDias - eventoB.distanciaDias);
}

function limparFormularioAporte() {
    estadoAplicacao.identificadorAporteEmEdicao = null;

    if (elementosInterface.campoTickerAporte) {
        elementosInterface.campoTickerAporte.value = '';
    }

    if (elementosInterface.campoQuantidadeAporte) {
        elementosInterface.campoQuantidadeAporte.value = '';
    }

    if (elementosInterface.campoPrecoAporte) {
        elementosInterface.campoPrecoAporte.value = '';
    }

    if (elementosInterface.campoDataAporte) {
        elementosInterface.campoDataAporte.value = '';
    }

    if (elementosInterface.campoObservacaoAporte) {
        elementosInterface.campoObservacaoAporte.value = '';
    }

    if (elementosInterface.botaoSalvarAporte) {
        elementosInterface.botaoSalvarAporte.textContent = 'Registrar aporte';
    }

    if (elementosInterface.botaoCancelarEdicaoAporte) {
        elementosInterface.botaoCancelarEdicaoAporte.classList.add('hidden');
    }
}

function renderizarMetas(patrimonioAtual, rendaMensalAtual) {
    const metaPatrimonio = converterParaNumeroSeguro(elementosInterface.campoMetaPatrimonio?.value, 0);
    const metaRendaMensal = converterParaNumeroSeguro(elementosInterface.campoMetaRendaMensal?.value, 0);

    const progressoMetaPatrimonio = calcularProgressoMetaPatrimonio(patrimonioAtual, metaPatrimonio);
    const progressoMetaRenda = calcularProgressoMetaRenda(rendaMensalAtual, metaRendaMensal);

    if (elementosInterface.cardMetaPatrimonio) {
        renderizarCardMetaPatrimonio(elementosInterface.cardMetaPatrimonio, progressoMetaPatrimonio, patrimonioAtual);
    }

    if (elementosInterface.cardMetaRenda) {
        renderizarCardMetaRenda(elementosInterface.cardMetaRenda, progressoMetaRenda, rendaMensalAtual);
    }
}

function resetarPainel() {
    estadoAplicacao.listaAtivosEmMemoria = [];
    estadoAplicacao.listaProventosEmMemoria = [];
    estadoAplicacao.listaAportesEmMemoria = [];
    estadoAplicacao.mapaLinhasExpandidas = {};

    if (elementosInterface.textoPatrimonioTotal) {
        elementosInterface.textoPatrimonioTotal.textContent = 'R$ 0,00';
    }

    if (elementosInterface.textoRendaMensal) {
        elementosInterface.textoRendaMensal.textContent = 'R$ 0,00';
    }

    if (elementosInterface.textoRendaPorHora) {
        elementosInterface.textoRendaPorHora.textContent = 'R$ 0,00 / hora';
    }

    if (elementosInterface.textoYieldOnCostMedio) {
        elementosInterface.textoYieldOnCostMedio.textContent = '0.00%';
    }

    if (elementosInterface.textoQuedaEstimada) {
        elementosInterface.textoQuedaEstimada.textContent = '- R$ 0,00';
    }

    if (elementosInterface.corpoTabelaAtivos) {
        elementosInterface.corpoTabelaAtivos.innerHTML = '<tr><td colspan="7" class="p-10 text-center text-slate-500 italic">Faça login para carregar seus ativos.</td></tr>';
    }

    if (elementosInterface.listaCardsMobileAtivos) {
        elementosInterface.listaCardsMobileAtivos.innerHTML = '<div class="glass p-6 rounded-[2rem] text-center text-slate-500 italic">Faça login para carregar seus ativos.</div>';
    }

    if (elementosInterface.corpoTabelaProventos) {
        elementosInterface.corpoTabelaProventos.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-slate-500 italic">Faça login para ver o histórico.</td></tr>';
    }

    if (elementosInterface.painelHistoricoAportes) {
        elementosInterface.painelHistoricoAportes.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum aporte registrado.</div>';
    }

    if (elementosInterface.painelAlertas) {
        elementosInterface.painelAlertas.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum alerta no momento.</div>';
    }

    if (elementosInterface.painelCalendarioCarteira) {
        elementosInterface.painelCalendarioCarteira.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum evento disponível.</div>';
    }

    if (elementosInterface.painelWatchlist) {
        elementosInterface.painelWatchlist.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum ativo em watchlist.</div>';
    }

    if (elementosInterface.painelFavoritos) {
        elementosInterface.painelFavoritos.innerHTML = '<div class="text-[11px] text-slate-500 italic">Nenhum ativo favorito.</div>';
    }

    if (elementosInterface.painelRankingOportunidades) {
        elementosInterface.painelRankingOportunidades.innerHTML = '<div class="text-[11px] text-slate-500 italic">Sem ativos para ranquear.</div>';
    }

    if (elementosInterface.painelComparador) {
        elementosInterface.painelComparador.innerHTML = '<div class="text-[11px] text-slate-500 italic">Selecione até 2 ativos na tabela para comparar.</div>';
    }

    if (elementosInterface.painelSimuladorGlobal) {
        elementosInterface.painelSimuladorGlobal.innerHTML = '<div class="text-[11px] text-slate-500 italic">Informe um valor para simular a distribuição do aporte.</div>';
    }

    renderizarMetas(0, 0);
}

function filtrarListaAtivosPorFiltroInteligente(listaAtivos) {
    switch (estadoAplicacao.filtroInteligenteAtual) {
        case 'favoritos':
            return listaAtivos.filter((ativo) => ativo.favorito);
        case 'watchlist':
            return listaAtivos.filter((ativo) => ativo.emWatchlist);
        case 'oportunidades':
            return listaAtivos.filter((ativo) => ativo.precoAtual > 0 && ativo.precoTeto > 0 && ativo.precoAtual <= ativo.precoTeto);
        case 'acima-do-teto':
            return listaAtivos.filter((ativo) => ativo.precoAtual > ativo.precoTeto && ativo.precoTeto > 0);
        case 'todos':
        default:
            return [...listaAtivos];
    }
}

function obterAtivosSelecionadosParaComparacao() {
    return (estadoAplicacao.listaAtivosSelecionadosParaComparacao || [])
        .map((identificadorAtivo) => estadoAplicacao.listaAtivosEmMemoria.find((ativo) => ativo.id === identificadorAtivo))
        .filter(Boolean)
        .slice(0, 2);
}

function atualizarContadoresDasAbas() {
    const quantidadeAtivos = estadoAplicacao.listaAtivosEmMemoria.length;
    const quantidadeAportes = estadoAplicacao.listaAportesEmMemoria.length;
    const quantidadeProventos = estadoAplicacao.listaProventosEmMemoria.length;
    const quantidadeAlertas = gerarListaAlertas(estadoAplicacao.listaAtivosEmMemoria).length;
    const quantidadeFavoritos = estadoAplicacao.listaAtivosEmMemoria.filter((ativo) => ativo.favorito).length;
    const quantidadeWatchlist = estadoAplicacao.listaAtivosEmMemoria.filter((ativo) => ativo.emWatchlist).length;

    if (elementosInterface.contadorAbaVisaoGeral) {
        elementosInterface.contadorAbaVisaoGeral.textContent = String(quantidadeAlertas);
    }

    if (elementosInterface.contadorAbaCarteira) {
        elementosInterface.contadorAbaCarteira.textContent = String(quantidadeAtivos);
    }

    if (elementosInterface.contadorAbaAportes) {
        elementosInterface.contadorAbaAportes.textContent = String(quantidadeAportes);
    }

    if (elementosInterface.contadorAbaProventos) {
        elementosInterface.contadorAbaProventos.textContent = String(quantidadeProventos);
    }

    if (elementosInterface.contadorAbaAnalises) {
        elementosInterface.contadorAbaAnalises.textContent = String(quantidadeAtivos);
    }

    if (elementosInterface.contadorAbaListas) {
        elementosInterface.contadorAbaListas.textContent = String(quantidadeFavoritos + quantidadeWatchlist);
    }

    if (elementosInterface.contadorAbaConfiguracoes) {
        elementosInterface.contadorAbaConfiguracoes.textContent = '2';
    }
}

function limparObservacoesWatchlistDeAtivosInexistentes() {
    const conjuntoIdsExistentes = new Set(estadoAplicacao.listaAtivosEmMemoria.map((ativo) => ativo.id));
    const novoMapa = {};

    Object.entries(estadoAplicacao.mapaObservacoesWatchlist || {}).forEach(([identificadorAtivo, observacao]) => {
        if (conjuntoIdsExistentes.has(identificadorAtivo)) {
            novoMapa[identificadorAtivo] = observacao;
        }
    });

    estadoAplicacao.mapaObservacoesWatchlist = novoMapa;
    salvarObservacoesWatchlistNoLocalStorage();
}

function atualizarResumoPainel(resultadoRenderizacao) {
    if (elementosInterface.textoPatrimonioTotal) {
        elementosInterface.textoPatrimonioTotal.textContent = `R$ ${formatarMoeda(resultadoRenderizacao.patrimonioTotal)}`;
    }

    if (elementosInterface.textoRendaMensal) {
        elementosInterface.textoRendaMensal.textContent = `R$ ${formatarMoeda(resultadoRenderizacao.projecaoMensalTotal)}`;
    }

    if (elementosInterface.textoRendaPorHora) {
        elementosInterface.textoRendaPorHora.textContent = `R$ ${formatarMoeda(resultadoRenderizacao.projecaoMensalTotal / 720, 4)} / hora`;
    }

    if (elementosInterface.textoYieldOnCostMedio) {
        elementosInterface.textoYieldOnCostMedio.textContent = resultadoRenderizacao.valorTotalInvestidoCarteira > 0
            ? `${((resultadoRenderizacao.projecaoMensalTotal * 12 / resultadoRenderizacao.valorTotalInvestidoCarteira) * 100).toFixed(2)}%`
            : '0.00%';
    }

    if (elementosInterface.textoQuedaEstimada) {
        elementosInterface.textoQuedaEstimada.textContent = `- R$ ${formatarMoeda(resultadoRenderizacao.patrimonioTotal * 0.05)}`;
    }

    renderizarMetas(resultadoRenderizacao.patrimonioTotal, resultadoRenderizacao.projecaoMensalTotal);
}

function renderizarTudo() {
    limparObservacoesWatchlistDeAtivosInexistentes();

    const listaAtivosFiltradaInteligente = filtrarListaAtivosPorFiltroInteligente(estadoAplicacao.listaAtivosEmMemoria);

    if (elementosInterface.corpoTabelaAtivos) {
        const resultadoRenderizacao = renderizarTabelaAtivos({
            corpoTabelaAtivos: elementosInterface.corpoTabelaAtivos,
            listaAtivos: listaAtivosFiltradaInteligente,
            filtroSegmentoAtual: estadoAplicacao.filtroSegmentoAtual,
            ordenacaoCarteiraAtual: estadoAplicacao.ordenacaoCarteiraAtual,
            caixaDisponivel: converterParaNumeroSeguro(elementosInterface.campoCaixaDisponivel?.value, 0),
            mapaLinhasExpandidas: estadoAplicacao.mapaLinhasExpandidas,
            listaAtivosSelecionadosParaComparacao: estadoAplicacao.listaAtivosSelecionadosParaComparacao,
            obterListaAtivosFiltradaEOrdenada,
            obterStatusAtivo
        });

        atualizarResumoPainel(resultadoRenderizacao);
    }

    if (elementosInterface.listaCardsMobileAtivos) {
        renderizarCardsMobileAtivos({
            listaCardsMobileAtivos: elementosInterface.listaCardsMobileAtivos,
            listaAtivos: listaAtivosFiltradaInteligente,
            filtroSegmentoAtual: estadoAplicacao.filtroSegmentoAtual,
            ordenacaoCarteiraAtual: estadoAplicacao.ordenacaoCarteiraAtual,
            mapaLinhasExpandidas: estadoAplicacao.mapaLinhasExpandidas,
            listaAtivosSelecionadosParaComparacao: estadoAplicacao.listaAtivosSelecionadosParaComparacao,
            obterListaAtivosFiltradaEOrdenada,
            obterStatusAtivo
        });
    }

    if (elementosInterface.corpoTabelaProventos) {
        renderizarHistoricoProventos(elementosInterface.corpoTabelaProventos, estadoAplicacao.listaProventosEmMemoria);
    }

    if (elementosInterface.painelHistoricoAportes) {
        renderizarPainelHistoricoAportes(elementosInterface.painelHistoricoAportes, estadoAplicacao.listaAportesEmMemoria);
    }

    if (elementosInterface.graficoAlocacaoSegmentos) {
        estadoAplicacao.instanciaGraficoSegmentos = renderizarGraficoSegmentos(
            elementosInterface.graficoAlocacaoSegmentos,
            estadoAplicacao.instanciaGraficoSegmentos,
            estadoAplicacao.listaAtivosEmMemoria
        );
    }

    const mapaProventosAgrupadosPorMes = {};
    estadoAplicacao.listaProventosEmMemoria.forEach((provento) => {
        mapaProventosAgrupadosPorMes[provento.mesAno] =
            converterParaNumeroSeguro(mapaProventosAgrupadosPorMes[provento.mesAno], 0) +
            converterParaNumeroSeguro(provento.valor, 0);
    });

    const listaMesesOrdenada = Object.keys(mapaProventosAgrupadosPorMes).sort((mesA, mesB) => mesA.localeCompare(mesB));

    if (elementosInterface.graficoProventos) {
        estadoAplicacao.instanciaGraficoProventos = renderizarGraficoProventos(
            elementosInterface.graficoProventos,
            estadoAplicacao.instanciaGraficoProventos,
            listaMesesOrdenada.map(formatarMesAno),
            listaMesesOrdenada.map((mesAno) => mapaProventosAgrupadosPorMes[mesAno])
        );
    }

    if (elementosInterface.painelWatchlist) {
        renderizarPainelWatchlist(elementosInterface.painelWatchlist, estadoAplicacao.listaAtivosEmMemoria, estadoAplicacao.mapaObservacoesWatchlist);
    }

    if (elementosInterface.painelFavoritos) {
        renderizarPainelFavoritos(elementosInterface.painelFavoritos, estadoAplicacao.listaAtivosEmMemoria);
    }

    const patrimonioTotal = estadoAplicacao.listaAtivosEmMemoria.reduce((soma, ativo) => soma + ativo.valorTotalAtual, 0);
    const somaDasNotas = estadoAplicacao.listaAtivosEmMemoria.reduce((soma, ativo) => soma + ativo.nota, 0);
    const caixaDisponivel = converterParaNumeroSeguro(elementosInterface.campoCaixaDisponivel?.value, 0);

    const listaRanking = gerarRankingDeOportunidades(
        estadoAplicacao.listaAtivosEmMemoria.filter((ativo) => !ativo.emWatchlist),
        patrimonioTotal,
        somaDasNotas,
        caixaDisponivel
    );

    if (elementosInterface.painelRankingOportunidades) {
        renderizarPainelRankingOportunidades(elementosInterface.painelRankingOportunidades, listaRanking);
    }

    const listaAlertas = gerarListaAlertas(estadoAplicacao.listaAtivosEmMemoria);

    if (elementosInterface.painelAlertas) {
        renderizarPainelAlertas(elementosInterface.painelAlertas, listaAlertas);
    }

    if (elementosInterface.painelComparador) {
        renderizarPainelComparador(elementosInterface.painelComparador, obterAtivosSelecionadosParaComparacao());
    }

    const resultadoSimulacaoGlobal = gerarSimulacaoGlobalDeAporte(
        converterParaNumeroSeguro(elementosInterface.campoValorAporteGlobal?.value, 0),
        listaRanking
    );

    if (elementosInterface.painelSimuladorGlobal) {
        renderizarPainelSimuladorGlobal(elementosInterface.painelSimuladorGlobal, resultadoSimulacaoGlobal);
    }

    const listaEventosCalendario = gerarEventosCalendarioCarteira(estadoAplicacao.listaAtivosEmMemoria);

    if (elementosInterface.painelCalendarioCarteira) {
        renderizarPainelCalendarioCarteira(elementosInterface.painelCalendarioCarteira, listaEventosCalendario);
    }

    atualizarContadoresDasAbas();
}

async function atualizarListaAtivosEnriquecida() {
    if (!estadoAplicacao.usuarioAtual || !estadoAplicacao.listaAtivosEmMemoria.length) {
        renderizarTudo();
        return;
    }

    const listaAtivosBruta = estadoAplicacao.listaAtivosEmMemoria.map((ativo) => ({
        id: ativo.id,
        uid: ativo.uid,
        ticker: ativo.ticker,
        quantidade: ativo.quantidadeCadastro ?? ativo.quantidade,
        precoMedio: ativo.precoMedioCadastro ?? ativo.precoMedio,
        nota: ativo.nota,
        precoTeto: ativo.precoTeto,
        precoAtualManual: ativo.precoAtualManual,
        diaDataCom: ativo.diaDataCom,
        diaPagamento: ativo.diaPagamento,
        segmento: ativo.segmento,
        observacao: ativo.observacao,
        favorito: ativo.favorito,
        emWatchlist: ativo.emWatchlist
    }));

    const tickers = listaAtivosBruta.map((ativo) => ativo.ticker);
    const mapaCotacoes = await buscarCotacoesNaBrapi(tickers);

    estadoAplicacao.listaAtivosEmMemoria = enriquecerListaAtivos(
        listaAtivosBruta,
        mapaCotacoes,
        estadoAplicacao.listaAportesEmMemoria
    );

    renderizarTudo();
}

function assinarColecaoAtivos() {
    if (!estadoAplicacao.usuarioAtual) {
        return;
    }

    if (typeof estadoAplicacao.cancelarInscricaoAtivos === 'function') {
        estadoAplicacao.cancelarInscricaoAtivos();
    }

    const consultaAtivos = query(collection(db, 'ativos'), where('uid', '==', estadoAplicacao.usuarioAtual.uid));

    estadoAplicacao.cancelarInscricaoAtivos = onSnapshot(
        consultaAtivos,
        async (snapshot) => {
            const listaAtivosBruta = snapshot.docs.map((documento) => ({
                id: documento.id,
                ...documento.data()
            }));

            const mapaCotacoes = await buscarCotacoesNaBrapi(listaAtivosBruta.map((ativo) => ativo.ticker));

            estadoAplicacao.listaAtivosEmMemoria = enriquecerListaAtivos(
                listaAtivosBruta,
                mapaCotacoes,
                estadoAplicacao.listaAportesEmMemoria
            );

            renderizarTudo();
        },
        (erro) => {
            console.error('Erro ao escutar ativos:', erro);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Erro ao carregar os ativos.', 'erro');
        }
    );
}

function assinarColecaoProventos() {
    if (!estadoAplicacao.usuarioAtual) {
        return;
    }

    if (typeof estadoAplicacao.cancelarInscricaoProventos === 'function') {
        estadoAplicacao.cancelarInscricaoProventos();
    }

    const consultaProventos = query(collection(db, 'proventos'), where('uid', '==', estadoAplicacao.usuarioAtual.uid));

    estadoAplicacao.cancelarInscricaoProventos = onSnapshot(
        consultaProventos,
        (snapshot) => {
            estadoAplicacao.listaProventosEmMemoria = snapshot.docs.map((documento) => ({
                id: documento.id,
                ticker: normalizarTicker(documento.data().ticker),
                valor: converterParaNumeroSeguro(documento.data().valor, 0),
                mesAno: documento.data().mesAno || ''
            }));

            renderizarTudo();
        },
        (erro) => {
            console.error('Erro ao escutar proventos:', erro);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Erro ao carregar os proventos.', 'erro');
        }
    );
}

function assinarColecaoAportes() {
    if (!estadoAplicacao.usuarioAtual) {
        return;
    }

    if (typeof estadoAplicacao.cancelarInscricaoAportes === 'function') {
        estadoAplicacao.cancelarInscricaoAportes();
    }

    const consultaAportes = query(collection(db, 'aportes'), where('uid', '==', estadoAplicacao.usuarioAtual.uid));

    estadoAplicacao.cancelarInscricaoAportes = onSnapshot(
        consultaAportes,
        async (snapshot) => {
            estadoAplicacao.listaAportesEmMemoria = snapshot.docs.map((documento) => ({
                id: documento.id,
                ...documento.data()
            }));

            await atualizarListaAtivosEnriquecida();
        },
        (erro) => {
            console.error('Erro ao escutar aportes:', erro);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Erro ao carregar os aportes.', 'erro');
        }
    );
}

function cancelarEdicaoAtivo() {
    estadoAplicacao.identificadorAtivoEmEdicao = null;

    if (elementosInterface.botaoSalvarAtivo) {
        elementosInterface.botaoSalvarAtivo.textContent = 'Salvar no Portfólio';
    }

    if (elementosInterface.botaoCancelarEdicaoAtivo) {
        elementosInterface.botaoCancelarEdicaoAtivo.classList.add('hidden');
    }

    if (elementosInterface.tituloFormularioAtivo) {
        elementosInterface.tituloFormularioAtivo.textContent = 'Gerenciar Ativo';
    }

    Object.values(camposFormularioAtivo).forEach((campo) => {
        if (!campo) {
            return;
        }

        if (campo.tagName === 'SELECT') {
            campo.value = 'Papel';
        } else {
            campo.value = '';
        }
    });

    limparErrosDosCampos(Object.values(camposFormularioAtivo).filter(Boolean));
}

async function prepararEdicaoAtivo(identificadorAtivo) {
    try {
        const referenciaDocumento = doc(db, 'ativos', identificadorAtivo);
        const documentoAtivo = await getDoc(referenciaDocumento);

        if (!documentoAtivo.exists()) {
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo não encontrado para edição.', 'erro');
            return;
        }

        const dadosAtivo = documentoAtivo.data();

        if (camposFormularioAtivo.ticker) camposFormularioAtivo.ticker.value = dadosAtivo.ticker || '';
        if (camposFormularioAtivo.quantidade) camposFormularioAtivo.quantidade.value = dadosAtivo.quantidade || '';
        if (camposFormularioAtivo.precoMedio) camposFormularioAtivo.precoMedio.value = dadosAtivo.precoMedio || '';
        if (camposFormularioAtivo.nota) camposFormularioAtivo.nota.value = dadosAtivo.nota || '';
        if (camposFormularioAtivo.precoTeto) camposFormularioAtivo.precoTeto.value = dadosAtivo.precoTeto || '';
        if (camposFormularioAtivo.precoAtualManual) camposFormularioAtivo.precoAtualManual.value = dadosAtivo.precoAtualManual || '';
        if (camposFormularioAtivo.diaDataCom) camposFormularioAtivo.diaDataCom.value = dadosAtivo.diaDataCom || '';
        if (camposFormularioAtivo.diaPagamento) camposFormularioAtivo.diaPagamento.value = dadosAtivo.diaPagamento || '';
        if (camposFormularioAtivo.segmento) camposFormularioAtivo.segmento.value = dadosAtivo.segmento || 'Outros';
        if (camposFormularioAtivo.observacao) camposFormularioAtivo.observacao.value = dadosAtivo.observacao || '';

        estadoAplicacao.identificadorAtivoEmEdicao = identificadorAtivo;

        if (elementosInterface.botaoSalvarAtivo) {
            elementosInterface.botaoSalvarAtivo.textContent = 'Atualizar Ativo';
        }

        if (elementosInterface.botaoCancelarEdicaoAtivo) {
            elementosInterface.botaoCancelarEdicaoAtivo.classList.remove('hidden');
        }

        if (elementosInterface.tituloFormularioAtivo) {
            elementosInterface.tituloFormularioAtivo.textContent = 'Editando Ativo';
        }

        alternarAbaPrincipal('carteira');
        alternarSubaba('carteira', 'gestao');
    } catch (erro) {
        console.error('Erro ao carregar ativo para edição:', erro);
        mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao carregar ativo para edição: ${erro.message}`, 'erro');
    }
}

async function salvarAtivo() {
    if (!estadoAplicacao.usuarioAtual) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Faça login primeiro.', 'info');
        return;
    }

    const valorPrecoAtualManual = camposFormularioAtivo.precoAtualManual?.value;
    const precoAtualManual = valorPrecoAtualManual === '' || valorPrecoAtualManual === null || valorPrecoAtualManual === undefined
        ? null
        : converterParaNumeroSeguro(valorPrecoAtualManual, 0);

    const dadosAtivo = {
        uid: estadoAplicacao.usuarioAtual.uid,
        ticker: normalizarTicker(camposFormularioAtivo.ticker?.value),
        quantidade: parseInt(camposFormularioAtivo.quantidade?.value, 10),
        precoMedio: converterParaNumeroSeguro(camposFormularioAtivo.precoMedio?.value, 0),
        nota: parseInt(camposFormularioAtivo.nota?.value, 10),
        precoTeto: converterParaNumeroSeguro(camposFormularioAtivo.precoTeto?.value, 0),
        precoAtualManual,
        diaDataCom: validarDiaDoMes(camposFormularioAtivo.diaDataCom?.value),
        diaPagamento: validarDiaDoMes(camposFormularioAtivo.diaPagamento?.value),
        segmento: camposFormularioAtivo.segmento?.value || 'Outros',
        observacao: camposFormularioAtivo.observacao?.value || '',
        favorito: false,
        emWatchlist: false,
        timestamp: serverTimestamp()
    };

    if (!validarDadosAtivo(dadosAtivo, camposFormularioAtivo)) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Revise os campos do ativo.', 'erro');
        return;
    }

    try {
        if (estadoAplicacao.identificadorAtivoEmEdicao) {
            const ativoAtual = estadoAplicacao.listaAtivosEmMemoria.find((ativo) => ativo.id === estadoAplicacao.identificadorAtivoEmEdicao);

            await updateDoc(doc(db, 'ativos', estadoAplicacao.identificadorAtivoEmEdicao), {
                ...dadosAtivo,
                favorito: Boolean(ativoAtual?.favorito),
                emWatchlist: Boolean(ativoAtual?.emWatchlist)
            });

            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo atualizado com sucesso.', 'sucesso');
        } else {
            await addDoc(collection(db, 'ativos'), dadosAtivo);
            mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo cadastrado com sucesso.', 'sucesso');
        }

        cancelarEdicaoAtivo();
    } catch (erro) {
        console.error('Erro ao salvar ativo:', erro);
        mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao salvar ativo: ${erro.message}`, 'erro');
    }
}

function cancelarEdicaoProvento() {
    estadoAplicacao.identificadorProventoEmEdicao = null;

    Object.values(camposFormularioProvento).forEach((campo) => {
        if (campo) {
            campo.value = '';
        }
    });

    if (elementosInterface.tituloFormularioProvento) {
        elementosInterface.tituloFormularioProvento.textContent = 'Lançar Provento';
    }

    if (elementosInterface.botaoSalvarProvento) {
        elementosInterface.botaoSalvarProvento.textContent = 'Registrar Provento';
    }

    if (elementosInterface.botaoCancelarEdicaoProvento) {
        elementosInterface.botaoCancelarEdicaoProvento.classList.add('hidden');
    }

    limparErrosDosCampos(Object.values(camposFormularioProvento).filter(Boolean));
}

function prepararEdicaoProvento(provento) {
    estadoAplicacao.identificadorProventoEmEdicao = provento.id;

    if (camposFormularioProvento.ticker) camposFormularioProvento.ticker.value = provento.ticker;
    if (camposFormularioProvento.valor) camposFormularioProvento.valor.value = provento.valor;
    if (camposFormularioProvento.mes) camposFormularioProvento.mes.value = provento.mesAno;

    if (elementosInterface.tituloFormularioProvento) {
        elementosInterface.tituloFormularioProvento.textContent = 'Editar Provento';
    }

    if (elementosInterface.botaoSalvarProvento) {
        elementosInterface.botaoSalvarProvento.textContent = 'Atualizar Provento';
    }

    if (elementosInterface.botaoCancelarEdicaoProvento) {
        elementosInterface.botaoCancelarEdicaoProvento.classList.remove('hidden');
    }

    alternarAbaPrincipal('proventos');
}

async function salvarProvento() {
    if (!estadoAplicacao.usuarioAtual) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Faça login primeiro.', 'info');
        return;
    }

    const dadosProvento = {
        uid: estadoAplicacao.usuarioAtual.uid,
        ticker: normalizarTicker(camposFormularioProvento.ticker?.value),
        valor: converterParaNumeroSeguro(camposFormularioProvento.valor?.value, NaN),
        mesAno: camposFormularioProvento.mes?.value,
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
        console.error('Erro ao salvar provento:', erro);
        mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao salvar provento: ${erro.message}`, 'erro');
    }
}

function abrirFormularioProventoComTickerPreenchido(ticker) {
    alternarAbaPrincipal('proventos');

    if (camposFormularioProvento.ticker) {
        camposFormularioProvento.ticker.value = ticker;
    }
}

function prepararEdicaoAporte(identificadorAporte) {
    const aporte = estadoAplicacao.listaAportesEmMemoria.find((item) => item.id === identificadorAporte);

    if (!aporte) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Aporte não encontrado.', 'erro');
        return;
    }

    estadoAplicacao.identificadorAporteEmEdicao = identificadorAporte;

    if (elementosInterface.campoTickerAporte) elementosInterface.campoTickerAporte.value = aporte.ticker || '';
    if (elementosInterface.campoQuantidadeAporte) elementosInterface.campoQuantidadeAporte.value = aporte.quantidadeComprada || '';
    if (elementosInterface.campoPrecoAporte) elementosInterface.campoPrecoAporte.value = aporte.precoPorCota || '';
    if (elementosInterface.campoDataAporte) elementosInterface.campoDataAporte.value = aporte.dataAporte || '';
    if (elementosInterface.campoObservacaoAporte) elementosInterface.campoObservacaoAporte.value = aporte.observacao || '';

    if (elementosInterface.botaoSalvarAporte) {
        elementosInterface.botaoSalvarAporte.textContent = 'Atualizar aporte';
    }

    if (elementosInterface.botaoCancelarEdicaoAporte) {
        elementosInterface.botaoCancelarEdicaoAporte.classList.remove('hidden');
    }

    alternarAbaPrincipal('aportes');
    alternarSubaba('aportes', 'registrar');
}

async function salvarAporte() {
    if (!estadoAplicacao.usuarioAtual) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Faça login primeiro.', 'info');
        return;
    }

    try {
        const dadosAporte = montarDadosAporte({
            usuarioAtual: estadoAplicacao.usuarioAtual,
            ticker: elementosInterface.campoTickerAporte?.value,
            quantidadeComprada: elementosInterface.campoQuantidadeAporte?.value,
            precoPorCota: elementosInterface.campoPrecoAporte?.value,
            dataAporte: elementosInterface.campoDataAporte?.value,
            observacao: elementosInterface.campoObservacaoAporte?.value
        });

        const mensagemSucesso = await salvarAporteNoFirestore({
            db,
            identificadorAporteEmEdicao: estadoAplicacao.identificadorAporteEmEdicao,
            dadosAporte
        });

        mostrarNotificacao(elementosInterface.containerNotificacoes, mensagemSucesso, 'sucesso');
        limparFormularioAporte();
    } catch (erro) {
        console.error('Erro ao salvar aporte:', erro);
        mostrarNotificacao(elementosInterface.containerNotificacoes, erro.message || 'Erro ao salvar aporte.', 'erro');
    }
}

async function alternarFavorito(identificadorAtivo) {
    const ativo = estadoAplicacao.listaAtivosEmMemoria.find((item) => item.id === identificadorAtivo);

    if (!ativo) {
        return;
    }

    await updateDoc(doc(db, 'ativos', identificadorAtivo), {
        favorito: !ativo.favorito
    });
}

async function alternarWatchlist(identificadorAtivo) {
    const ativo = estadoAplicacao.listaAtivosEmMemoria.find((item) => item.id === identificadorAtivo);

    if (!ativo) {
        return;
    }

    await updateDoc(doc(db, 'ativos', identificadorAtivo), {
        emWatchlist: !ativo.emWatchlist
    });
}

function alternarAtivoNoComparador(identificadorAtivo) {
    const listaAtual = estadoAplicacao.listaAtivosSelecionadosParaComparacao || [];

    if (listaAtual.includes(identificadorAtivo)) {
        estadoAplicacao.listaAtivosSelecionadosParaComparacao = listaAtual.filter((item) => item !== identificadorAtivo);
        salvarComparadorNoLocalStorage();
        return;
    }

    if (listaAtual.length >= 2) {
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'O comparador aceita no máximo 2 ativos.', 'info');
        return;
    }

    estadoAplicacao.listaAtivosSelecionadosParaComparacao = [...listaAtual, identificadorAtivo];
    salvarComparadorNoLocalStorage();
}

function limparComparador() {
    estadoAplicacao.listaAtivosSelecionadosParaComparacao = [];
    salvarComparadorNoLocalStorage();
    renderizarTudo();
}

function exportarRelatorioCarteira() {
    const patrimonioTotal = estadoAplicacao.listaAtivosEmMemoria.reduce((soma, ativo) => soma + ativo.valorTotalAtual, 0);
    const rendaMensal = estadoAplicacao.listaAtivosEmMemoria.reduce((soma, ativo) => soma + ativo.rendaMensalEstimada, 0);
    const valorTotalInvestido = estadoAplicacao.listaAtivosEmMemoria.reduce((soma, ativo) => soma + ativo.valorTotalInvestido, 0);
    const yieldOnCost = valorTotalInvestido > 0 ? ((rendaMensal * 12 / valorTotalInvestido) * 100) : 0;
    const quedaEstimada = patrimonioTotal * 0.05;
    const somaDasNotas = estadoAplicacao.listaAtivosEmMemoria.reduce((soma, ativo) => soma + ativo.nota, 0);
    const caixaDisponivel = converterParaNumeroSeguro(elementosInterface.campoCaixaDisponivel?.value, 0);

    const listaFavoritos = estadoAplicacao.listaAtivosEmMemoria.filter((ativo) => ativo.favorito);
    const listaWatchlist = estadoAplicacao.listaAtivosEmMemoria.filter((ativo) => ativo.emWatchlist);
    const listaAlertas = gerarListaAlertas(estadoAplicacao.listaAtivosEmMemoria);

    const listaRanking = gerarRankingDeOportunidades(
        estadoAplicacao.listaAtivosEmMemoria.filter((ativo) => !ativo.emWatchlist),
        patrimonioTotal,
        somaDasNotas,
        caixaDisponivel
    );

    const listaEventosCalendario = gerarEventosCalendarioCarteira(estadoAplicacao.listaAtivosEmMemoria);

    const conteudoRelatorio = gerarConteudoRelatorioCarteira({
        patrimonioTotal,
        rendaMensal,
        yieldOnCost,
        quedaEstimada,
        listaFavoritos,
        listaWatchlist,
        listaAlertas,
        listaRanking,
        listaEventosCalendario,
        listaAtivos: estadoAplicacao.listaAtivosEmMemoria
    });

    exportarRelatorioCarteiraComoTxt(
        `relatorio-fii-insight-${new Date().toISOString().slice(0, 10)}.txt`,
        conteudoRelatorio
    );

    mostrarNotificacao(elementosInterface.containerNotificacoes, 'Relatório exportado com sucesso.', 'sucesso');
}

function inicializarEventosDaInterface() {
    carregarMetasDoLocalStorage();
    carregarFiltroEOrdenacaoDoLocalStorage();
    carregarComparadorDoLocalStorage();
    carregarModoPrivacidadeDoLocalStorage();
    carregarObservacoesWatchlistDoLocalStorage();
    carregarAporteGlobalNoLocalStorage();
    carregarEstadoMenuDoLocalStorage();

    alternarAbaPrincipal(carregarAbaPrincipalDoLocalStorage());
    alternarSubaba('carteira', carregarSubabaDoLocalStorage('carteira'));
    alternarSubaba('aportes', carregarSubabaDoLocalStorage('aportes'));
    alternarSubaba('analises', carregarSubabaDoLocalStorage('analises'));

    adicionarEventoSeElementoExistir(elementosInterface.botaoAlternarMenu, 'click', alternarMenuSuperior);

    adicionarEventoSeElementoExistir(elementosInterface.navegacaoAbasPrincipais, 'click', (evento) => {
        const botaoAbaPrincipal = evento.target.closest('[data-aba-principal]');
        if (!botaoAbaPrincipal) return;
        alternarAbaPrincipal(botaoAbaPrincipal.dataset.abaPrincipal);
    });

    adicionarEventoSeElementoExistir(elementosInterface.navegacaoSubabasCarteira, 'click', (evento) => {
        const botaoSubaba = evento.target.closest('[data-subaba-grupo="carteira"]');
        if (!botaoSubaba) return;
        alternarSubaba('carteira', botaoSubaba.dataset.subaba);
    });

    adicionarEventoSeElementoExistir(elementosInterface.navegacaoSubabasAportes, 'click', (evento) => {
        const botaoSubaba = evento.target.closest('[data-subaba-grupo="aportes"]');
        if (!botaoSubaba) return;
        alternarSubaba('aportes', botaoSubaba.dataset.subaba);
    });

    adicionarEventoSeElementoExistir(elementosInterface.navegacaoSubabasAnalises, 'click', (evento) => {
        const botaoSubaba = evento.target.closest('[data-subaba-grupo="analises"]');
        if (!botaoSubaba) return;
        alternarSubaba('analises', botaoSubaba.dataset.subaba);
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoModoPrivacidade, 'click', () => {
        estadoAplicacao.modoPrivacidadeAtivo = !estadoAplicacao.modoPrivacidadeAtivo;
        document.body.classList.toggle('modo-privacidade', estadoAplicacao.modoPrivacidadeAtivo);

        if (elementosInterface.iconeModoPrivacidade) {
            elementosInterface.iconeModoPrivacidade.innerText = estadoAplicacao.modoPrivacidadeAtivo ? '🙈' : '👁️';
        }

        salvarModoPrivacidadeNoLocalStorage();
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoAcaoRapidaNovoAtivo, 'click', () => {
        alternarAbaPrincipal('carteira');
        alternarSubaba('carteira', 'gestao');
        camposFormularioAtivo.ticker?.focus();
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoAcaoRapidaNovoAporte, 'click', () => {
        alternarAbaPrincipal('aportes');
        alternarSubaba('aportes', 'registrar');
        elementosInterface.campoTickerAporte?.focus();
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoAcaoRapidaNovoProvento, 'click', () => {
        alternarAbaPrincipal('proventos');
        camposFormularioProvento.ticker?.focus();
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoAcaoRapidaComparador, 'click', () => {
        alternarAbaPrincipal('analises');
        alternarSubaba('analises', 'comparador');
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoAcaoRapidaBackup, 'click', () => {
        alternarAbaPrincipal('configuracoes');
    });

    adicionarEventoSeElementoExistir(elementosInterface.containerFiltrosSegmento, 'click', (evento) => {
        const botaoFiltro = evento.target.closest('.botao-filtro');
        if (!botaoFiltro) return;

        estadoAplicacao.filtroSegmentoAtual = botaoFiltro.dataset.filtro;
        salvarFiltroEOrdenacaoNoLocalStorage();
        carregarFiltroEOrdenacaoDoLocalStorage();
        renderizarTudo();
    });

    adicionarEventoSeElementoExistir(elementosInterface.containerFiltrosInteligentes, 'click', (evento) => {
        const botaoFiltroInteligente = evento.target.closest('.botao-filtro-inteligente');
        if (!botaoFiltroInteligente) return;

        estadoAplicacao.filtroInteligenteAtual = botaoFiltroInteligente.dataset.filtroInteligente;
        salvarFiltroEOrdenacaoNoLocalStorage();
        carregarFiltroEOrdenacaoDoLocalStorage();
        renderizarTudo();
    });

    adicionarEventoSeElementoExistir(elementosInterface.containerOrdenacaoCarteira, 'click', (evento) => {
        const botaoOrdenacao = evento.target.closest('.botao-ordenacao');
        if (!botaoOrdenacao) return;

        estadoAplicacao.ordenacaoCarteiraAtual = botaoOrdenacao.dataset.ordenacao;
        salvarFiltroEOrdenacaoNoLocalStorage();
        carregarFiltroEOrdenacaoDoLocalStorage();
        renderizarTudo();
    });

    adicionarEventoSeElementoExistir(elementosInterface.botaoLimparComparador, 'click', limparComparador);
    adicionarEventoSeElementoExistir(elementosInterface.botaoExportarRelatorio, 'click', exportarRelatorioCarteira);
    adicionarEventoSeElementoExistir(elementosInterface.botaoSalvarAtivo, 'click', salvarAtivo);
    adicionarEventoSeElementoExistir(elementosInterface.botaoCancelarEdicaoAtivo, 'click', cancelarEdicaoAtivo);
    adicionarEventoSeElementoExistir(elementosInterface.botaoSalvarProvento, 'click', salvarProvento);
    adicionarEventoSeElementoExistir(elementosInterface.botaoCancelarEdicaoProvento, 'click', cancelarEdicaoProvento);
    adicionarEventoSeElementoExistir(elementosInterface.botaoSalvarAporte, 'click', salvarAporte);
    adicionarEventoSeElementoExistir(elementosInterface.botaoCancelarEdicaoAporte, 'click', limparFormularioAporte);

    adicionarEventoSeElementoExistir(elementosInterface.campoMetaPatrimonio, 'input', () => {
        salvarMetasNoLocalStorage();
        renderizarTudo();
    });

    adicionarEventoSeElementoExistir(elementosInterface.campoMetaRendaMensal, 'input', () => {
        salvarMetasNoLocalStorage();
        renderizarTudo();
    });

    adicionarEventoSeElementoExistir(elementosInterface.campoValorAporteGlobal, 'input', () => {
        salvarAporteGlobalNoLocalStorage();
        renderizarTudo();
    });

    adicionarEventoSeElementoExistir(elementosInterface.campoCaixaDisponivel, 'input', renderizarTudo);

    adicionarEventoSeElementoExistir(elementosInterface.botaoExportarBackup, 'click', () => {
        exportarCarteiraParaJson(estadoAplicacao.listaAtivosEmMemoria, estadoAplicacao.listaProventosEmMemoria);
        mostrarNotificacao(elementosInterface.containerNotificacoes, 'Backup exportado com sucesso.', 'sucesso');
    });

    adicionarEventoSeElementoExistir(elementosInterface.campoImportarBackup, 'change', async (evento) => {
        const arquivo = evento.target.files?.[0];
        if (!arquivo) return;

        try {
            const dadosImportados = await importarCarteiraDeArquivo(arquivo);

            if (!estadoAplicacao.usuarioAtual) {
                throw new Error('Faça login antes de restaurar um backup.');
            }

            const resultadoRestauracao = await restaurarBackupNoFirestore({
                db,
                usuarioAtual: estadoAplicacao.usuarioAtual,
                ativos: dadosImportados.ativos,
                proventos: dadosImportados.proventos
            });

            mostrarNotificacao(
                elementosInterface.containerNotificacoes,
                `Backup restaurado com sucesso. Ativos: ${resultadoRestauracao.quantidadeAtivos}, Proventos: ${resultadoRestauracao.quantidadeProventos}.`,
                'sucesso'
            );
        } catch (erro) {
            console.error('Erro ao importar backup:', erro);
            mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao importar backup: ${erro.message}`, 'erro');
        } finally {
            evento.target.value = '';
        }
    });

    const tratarCliqueAcoesAtivo = async (evento) => {
        const botaoEditarAtivo = evento.target.closest('.botao-editar-ativo');
        const botaoExcluirAtivo = evento.target.closest('.botao-excluir-ativo');
        const botaoDetalhesAtivo = evento.target.closest('.botao-detalhes-ativo');
        const botaoRegistrarProvento = evento.target.closest('.botao-registrar-provento');
        const botaoAlternarFavorito = evento.target.closest('.botao-alternar-favorito');
        const botaoAlternarWatchlist = evento.target.closest('.botao-alternar-watchlist');
        const botaoAlternarComparador = evento.target.closest('.botao-alternar-comparador');

        if (botaoEditarAtivo) {
            await prepararEdicaoAtivo(botaoEditarAtivo.dataset.id);
            return;
        }

        if (botaoExcluirAtivo) {
            const confirmouExclusao = confirm('Deseja realmente excluir este ativo?');
            if (!confirmouExclusao) return;

            try {
                await deleteDoc(doc(db, 'ativos', botaoExcluirAtivo.dataset.id));
                mostrarNotificacao(elementosInterface.containerNotificacoes, 'Ativo excluído com sucesso.', 'sucesso');
            } catch (erro) {
                console.error('Erro ao excluir ativo:', erro);
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao excluir ativo: ${erro.message}`, 'erro');
            }
            return;
        }

        if (botaoDetalhesAtivo) {
            const identificadorAtivo = botaoDetalhesAtivo.dataset.id;
            estadoAplicacao.mapaLinhasExpandidas[identificadorAtivo] = !estadoAplicacao.mapaLinhasExpandidas[identificadorAtivo];
            renderizarTudo();
            return;
        }

        if (botaoRegistrarProvento) {
            abrirFormularioProventoComTickerPreenchido(botaoRegistrarProvento.dataset.ticker);
            return;
        }

        if (botaoAlternarFavorito) {
            try {
                await alternarFavorito(botaoAlternarFavorito.dataset.id);
            } catch (erro) {
                console.error('Erro ao alterar favorito:', erro);
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao alterar favorito: ${erro.message}`, 'erro');
            }
            return;
        }

        if (botaoAlternarWatchlist) {
            try {
                await alternarWatchlist(botaoAlternarWatchlist.dataset.id);
            } catch (erro) {
                console.error('Erro ao alterar watchlist:', erro);
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao alterar watchlist: ${erro.message}`, 'erro');
            }
            return;
        }

        if (botaoAlternarComparador) {
            alternarAtivoNoComparador(botaoAlternarComparador.dataset.id);
            alternarAbaPrincipal('analises');
            alternarSubaba('analises', 'comparador');
            renderizarTudo();
        }
    };

    adicionarEventoSeElementoExistir(elementosInterface.corpoTabelaAtivos, 'click', tratarCliqueAcoesAtivo);
    adicionarEventoSeElementoExistir(elementosInterface.listaCardsMobileAtivos, 'click', tratarCliqueAcoesAtivo);

    adicionarEventoSeElementoExistir(elementosInterface.corpoTabelaAtivos, 'input', (evento) => {
        const campoObservacaoWatchlist = evento.target.closest('.campo-observacao-watchlist');

        if (!campoObservacaoWatchlist) {
            return;
        }

        estadoAplicacao.mapaObservacoesWatchlist[campoObservacaoWatchlist.dataset.id] = campoObservacaoWatchlist.value || '';
        salvarObservacoesWatchlistNoLocalStorage();
    });

    adicionarEventoSeElementoExistir(elementosInterface.listaCardsMobileAtivos, 'input', (evento) => {
        const campoObservacaoWatchlist = evento.target.closest('.campo-observacao-watchlist');

        if (!campoObservacaoWatchlist) {
            return;
        }

        estadoAplicacao.mapaObservacoesWatchlist[campoObservacaoWatchlist.dataset.id] = campoObservacaoWatchlist.value || '';
        salvarObservacoesWatchlistNoLocalStorage();
    });

    adicionarEventoSeElementoExistir(elementosInterface.corpoTabelaProventos, 'click', async (evento) => {
        const botaoEditarProvento = evento.target.closest('.botao-editar-provento');
        const botaoExcluirProvento = evento.target.closest('.botao-excluir-provento');

        if (botaoEditarProvento) {
            const proventoSelecionado = estadoAplicacao.listaProventosEmMemoria.find((provento) => provento.id === botaoEditarProvento.dataset.id);
            if (proventoSelecionado) {
                prepararEdicaoProvento(proventoSelecionado);
            }
            return;
        }

        if (botaoExcluirProvento) {
            const confirmouExclusao = confirm('Deseja realmente excluir este provento?');
            if (!confirmouExclusao) return;

            try {
                await deleteDoc(doc(db, 'proventos', botaoExcluirProvento.dataset.id));
                mostrarNotificacao(elementosInterface.containerNotificacoes, 'Provento excluído com sucesso.', 'sucesso');
            } catch (erro) {
                console.error('Erro ao excluir provento:', erro);
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao excluir provento: ${erro.message}`, 'erro');
            }
        }
    });

    adicionarEventoSeElementoExistir(elementosInterface.painelHistoricoAportes, 'click', async (evento) => {
        const botaoEditarAporte = evento.target.closest('.botao-editar-aporte');
        const botaoExcluirAporte = evento.target.closest('.botao-excluir-aporte');

        if (botaoEditarAporte) {
            prepararEdicaoAporte(botaoEditarAporte.dataset.id);
            return;
        }

        if (botaoExcluirAporte) {
            const confirmouExclusao = confirm('Deseja realmente excluir este aporte?');
            if (!confirmouExclusao) return;

            try {
                await excluirAporteNoFirestore({
                    db,
                    identificadorAporte: botaoExcluirAporte.dataset.id
                });

                mostrarNotificacao(elementosInterface.containerNotificacoes, 'Aporte excluído com sucesso.', 'sucesso');
            } catch (erro) {
                console.error('Erro ao excluir aporte:', erro);
                mostrarNotificacao(elementosInterface.containerNotificacoes, `Erro ao excluir aporte: ${erro.message}`, 'erro');
            }
        }
    });

    Object.values(camposFormularioAtivo).filter(Boolean).forEach((campo) => {
        campo.addEventListener('input', () => {
            limparErrosDosCampos(Object.values(camposFormularioAtivo).filter(Boolean));
        });
    });

    Object.values(camposFormularioProvento).filter(Boolean).forEach((campo) => {
        campo.addEventListener('input', () => {
            limparErrosDosCampos(Object.values(camposFormularioProvento).filter(Boolean));
        });
    });

    vincularBotaoLoginAtual();
    atualizarContadoresDasAbas();
}

function inicializarAplicacaoComSeguranca() {
    try {
        atualizarBlocoUsuario(false);
        vincularBotaoLoginAtual();
        inicializarEventosDaInterface();
        resetarPainel();
    } catch (erro) {
        console.error('Erro na inicialização da aplicação:', erro);
        mostrarNotificacao(
            elementosInterface.containerNotificacoes,
            'Erro na inicialização da interface. Verifique o console do navegador.',
            'erro'
        );

        try {
            atualizarBlocoUsuario(false);
            vincularBotaoLoginAtual();
        } catch (erroSecundario) {
            console.error('Erro secundário ao restaurar login:', erroSecundario);
        }
    }
}

inicializarAplicacaoComSeguranca();

onAuthStateChanged(auth, (usuario) => {
    cancelarInscricoesAtivas();

    if (usuario) {
        estadoAplicacao.usuarioAtual = usuario;
        atualizarBlocoUsuario(true);
        resetarPainel();
        assinarColecaoAtivos();
        assinarColecaoProventos();
        assinarColecaoAportes();
        return;
    }

    estadoAplicacao.usuarioAtual = null;
    atualizarBlocoUsuario(false);
    vincularBotaoLoginAtual();
    resetarPainel();
});

