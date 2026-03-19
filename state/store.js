export const estadoAplicacao = {
    usuarioAtual: null,

    listaAtivosEmMemoria: [],
    listaProventosEmMemoria: [],
    listaAportesEmMemoria: [],

    identificadorAtivoEmEdicao: null,
    identificadorProventoEmEdicao: null,
    identificadorAporteEmEdicao: null,

    filtroSegmentoAtual: 'Todos',
    filtroInteligenteAtual: 'todos',
    ordenacaoCarteiraAtual: 'maior-posicao',

    listaAtivosSelecionadosParaComparacao: [],
    mapaLinhasExpandidas: {},
    mapaObservacoesWatchlist: {},

    modoPrivacidadeAtivo: false,

    cancelarInscricaoAtivos: null,
    cancelarInscricaoProventos: null,
    cancelarInscricaoAportes: null,

    instanciaGraficoProventos: null,
    instanciaGraficoSegmentos: null
};