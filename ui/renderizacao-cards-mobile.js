import { escaparHtml, formatarMoeda, obterClasseResultadoValor } from '../services/formatadores.js';
import { calcularScoreAtivo } from '../features/score-oportunidade.js';

function renderizarBlocoCampo(rotulo, valor, classesAdicionais = '') {
    return `
        <div class="cartao-ativo-mobile-campo">
            <div class="cartao-ativo-mobile-rotulo">${escaparHtml(rotulo)}</div>
            <div class="cartao-ativo-mobile-valor ${classesAdicionais}">${valor}</div>
        </div>
    `;
}

function gerarBotaoAcaoMobile({
    classeBotao,
    identificador,
    ticker,
    titulo,
    icone,
    texto,
    classeCor = ''
}) {
    const atributoIdentificador = identificador ? `data-id="${escaparHtml(identificador)}"` : '';
    const atributoTicker = ticker ? `data-ticker="${escaparHtml(ticker)}"` : '';

    return `
        <button
            ${atributoIdentificador}
            ${atributoTicker}
            type="button"
            class="botao-acao-tabela botao-acao-com-texto botao-acao-mobile ${classeBotao} ${classeCor}"
            title="${escaparHtml(titulo)}"
            aria-label="${escaparHtml(titulo)}"
        >
            <span class="botao-acao-icone">${icone}</span>
            <span class="botao-acao-texto">${escaparHtml(texto)}</span>
        </button>
    `;
}

export function renderizarCardsMobileAtivos({
    listaCardsMobileAtivos,
    listaAtivos,
    filtroSegmentoAtual,
    ordenacaoCarteiraAtual,
    mapaLinhasExpandidas,
    listaAtivosSelecionadosParaComparacao,
    obterListaAtivosFiltradaEOrdenada,
    obterStatusAtivo
}) {
    const listaAtivosFiltradaEOrdenada = obterListaAtivosFiltradaEOrdenada(
        listaAtivos,
        filtroSegmentoAtual,
        ordenacaoCarteiraAtual
    );

    let patrimonioTotal = 0;
    let somaDasNotas = 0;

    listaAtivos.forEach((ativo) => {
        patrimonioTotal += ativo.valorTotalAtual;
        somaDasNotas += ativo.nota;
    });

    if (!listaAtivosFiltradaEOrdenada.length) {
        listaCardsMobileAtivos.innerHTML = `
            <div class="glass p-6 rounded-[2rem] text-center text-slate-500 italic">
                Nenhum ativo corresponde aos filtros.
            </div>
        `;
        return;
    }

    listaCardsMobileAtivos.innerHTML = listaAtivosFiltradaEOrdenada.map((ativo) => {
        const pesoIdeal = somaDasNotas > 0 ? ativo.nota / somaDasNotas : 0;
        const pesoReal = patrimonioTotal > 0 ? ativo.valorTotalAtual / patrimonioTotal : 0;
        const scoreAtivo = calcularScoreAtivo(ativo, pesoReal, pesoIdeal);
        const statusAtivo = obterStatusAtivo(ativo, pesoReal, pesoIdeal);
        const estaNoComparador = listaAtivosSelecionadosParaComparacao.includes(ativo.id);
        const classeResultado = obterClasseResultadoValor(ativo.lucroPrejuizoValor);

        return `
            <div class="cartao-ativo-mobile">
                <div class="cartao-ativo-mobile-topo">
                    <div class="cartao-ativo-mobile-titulo">
                        <span class="cartao-ativo-mobile-ticker">${escaparHtml(ativo.ticker)}</span>
                        <div class="flex flex-wrap gap-2">
                            <span class="selo-status ${statusAtivo.classe}">${escaparHtml(statusAtivo.rotulo)}</span>
                            ${ativo.favorito ? '<span class="selo-status favorito">Favorito</span>' : ''}
                            ${ativo.emWatchlist ? '<span class="selo-status watchlist">Watchlist</span>' : ''}
                        </div>
                    </div>

                    <div class="text-right">
                        <div class="text-[10px] text-slate-500 font-black uppercase">${escaparHtml(ativo.segmento)}</div>
                        <div class="text-[10px] text-blue-300 font-black mt-1">Nota ${ativo.nota}</div>
                    </div>
                </div>

                <div class="cartao-ativo-mobile-grade">
                    ${renderizarBlocoCampo('Preço atual', ativo.precoAtual > 0 ? `R$ ${formatarMoeda(ativo.precoAtual)}` : 'API OFF', 'valor-sensivel')}
                    ${renderizarBlocoCampo('Preço teto', `R$ ${formatarMoeda(ativo.precoTeto)}`, 'valor-sensivel')}
                    ${renderizarBlocoCampo('Renda mensal', `R$ ${formatarMoeda(ativo.rendaMensalEstimada)}`, 'valor-sensivel text-emerald-400')}
                    ${renderizarBlocoCampo('Posição atual', `R$ ${formatarMoeda(ativo.valorTotalAtual)}`, 'valor-sensivel')}
                    ${renderizarBlocoCampo('Resultado', `${ativo.lucroPrejuizoValor >= 0 ? '+' : '-'} R$ ${formatarMoeda(Math.abs(ativo.lucroPrejuizoValor))}`, `valor-sensivel ${classeResultado}`)}
                    ${renderizarBlocoCampo('Score', `${scoreAtivo.toFixed(1)} / 10`, 'text-cyan-300')}
                </div>

                <div class="cartao-ativo-mobile-acoes">
                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-editar-ativo',
                        identificador: ativo.id,
                        titulo: 'Editar ativo',
                        icone: '📝',
                        texto: 'Editar',
                        classeCor: 'botao-acao-neutro'
                    })}

                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-excluir-ativo',
                        identificador: ativo.id,
                        titulo: 'Excluir ativo',
                        icone: '🗑️',
                        texto: 'Excluir',
                        classeCor: 'botao-acao-perigo'
                    })}

                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-registrar-provento',
                        ticker: ativo.ticker,
                        titulo: 'Lançar provento',
                        icone: '💸',
                        texto: 'Provento',
                        classeCor: 'botao-acao-sucesso'
                    })}

                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-alternar-favorito',
                        identificador: ativo.id,
                        titulo: ativo.favorito ? 'Remover dos favoritos' : 'Marcar como favorito',
                        icone: ativo.favorito ? '★' : '☆',
                        texto: 'Favorito',
                        classeCor: 'botao-acao-favorito'
                    })}

                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-alternar-comparador',
                        identificador: ativo.id,
                        titulo: estaNoComparador ? 'Remover do comparador' : 'Adicionar ao comparador',
                        icone: '⇄',
                        texto: 'Comparar',
                        classeCor: 'botao-acao-informacao'
                    })}

                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-alternar-watchlist',
                        identificador: ativo.id,
                        titulo: ativo.emWatchlist ? 'Remover da watchlist' : 'Adicionar à watchlist',
                        icone: '🔖',
                        texto: 'Watchlist',
                        classeCor: 'botao-acao-watchlist'
                    })}

                    ${gerarBotaoAcaoMobile({
                        classeBotao: 'botao-detalhes-ativo',
                        identificador: ativo.id,
                        titulo: mapaLinhasExpandidas[ativo.id] ? 'Ocultar detalhes' : 'Expandir detalhes',
                        icone: mapaLinhasExpandidas[ativo.id] ? '▴' : '▾',
                        texto: 'Detalhes',
                        classeCor: 'botao-acao-neutro'
                    })}
                </div>

                ${
                    mapaLinhasExpandidas[ativo.id]
                        ? `
                            <div class="cartao-ativo-mobile-detalhes">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    ${renderizarBlocoCampo('Quantidade', String(ativo.quantidade))}
                                    ${renderizarBlocoCampo('Preço médio', `R$ ${formatarMoeda(ativo.precoMedio)}`, 'valor-sensivel')}
                                    ${renderizarBlocoCampo('Data com', ativo.diaDataCom == null ? '--' : String(ativo.diaDataCom))}
                                    ${renderizarBlocoCampo('Pagamento', ativo.diaPagamento == null ? '--' : String(ativo.diaPagamento))}
                                    ${renderizarBlocoCampo('Renda anual', `R$ ${formatarMoeda(ativo.rendaAnualEstimada)}`, 'valor-sensivel text-emerald-400')}
                                    ${renderizarBlocoCampo('Origem do cálculo', ativo.origemCalculoPosicao === 'aportes' ? 'Aportes' : 'Cadastro')}
                                </div>

                                <div class="mt-3">
                                    <div class="cartao-ativo-mobile-rotulo">Observações</div>
                                    <div class="area-observacao-detalhes">${escaparHtml(ativo.observacao || 'Sem observações cadastradas.')}</div>
                                </div>
                            </div>
                        `
                        : ''
                }
            </div>
        `;
    }).join('');
}