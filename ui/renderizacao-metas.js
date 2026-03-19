import { formatarMoeda, formatarPercentual } from '../services/formatadores.js';

export function renderizarCardMetaPatrimonio(cardMetaPatrimonio, progressoMetaPatrimonio, patrimonioAtual) {
    cardMetaPatrimonio.innerHTML = `
        <div class="titulo-cartao-meta">Meta de patrimônio</div>
        <div class="valor-cartao-meta valor-sensivel">R$ ${formatarMoeda(patrimonioAtual)}</div>
        <div class="texto-meta-secundario">
            Progresso: ${formatarPercentual(progressoMetaPatrimonio.percentualConcluido)}
        </div>
        <div class="texto-meta-secundario">
            Falta: R$ ${formatarMoeda(progressoMetaPatrimonio.valorFaltante)}
        </div>
        <div class="barra-progresso-meta">
            <div class="preenchimento-barra-meta" style="width: ${Math.min(100, progressoMetaPatrimonio.percentualConcluido)}%"></div>
        </div>
    `;
}

export function renderizarCardMetaRenda(cardMetaRenda, progressoMetaRenda, rendaMensalAtual) {
    cardMetaRenda.innerHTML = `
        <div class="titulo-cartao-meta">Meta de renda mensal</div>
        <div class="valor-cartao-meta valor-sensivel">R$ ${formatarMoeda(rendaMensalAtual)}</div>
        <div class="texto-meta-secundario">
            Progresso: ${formatarPercentual(progressoMetaRenda.percentualConcluido)}
        </div>
        <div class="texto-meta-secundario">
            Falta: R$ ${formatarMoeda(progressoMetaRenda.valorFaltante)}
        </div>
        <div class="barra-progresso-meta">
            <div class="preenchimento-barra-meta" style="width: ${Math.min(100, progressoMetaRenda.percentualConcluido)}%"></div>
        </div>
    `;
}