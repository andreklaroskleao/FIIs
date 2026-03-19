import { formatarMoeda } from '../services/formatadores.js';

export function renderizarCardMetaPatrimonio(elemento, progressoMetaPatrimonio, patrimonioAtual) {
    elemento.innerHTML = `
        <div class="titulo-cartao-meta">Meta de patrimônio</div>
        <div class="valor-cartao-meta valor-sensivel">R$ ${formatarMoeda(patrimonioAtual)}</div>
        <div class="texto-meta-secundario">
            ${progressoMetaPatrimonio.atingida
                ? 'Meta atingida'
                : `Faltam R$ ${formatarMoeda(progressoMetaPatrimonio.faltante)}`}
        </div>
        <div class="barra-progresso-meta">
            <div class="preenchimento-barra-meta" style="width:${progressoMetaPatrimonio.percentual}%"></div>
        </div>
        <div class="texto-meta-secundario">${progressoMetaPatrimonio.percentual.toFixed(1)}% concluído</div>
    `;
}

export function renderizarCardMetaRenda(elemento, progressoMetaRenda, rendaMensalAtual) {
    elemento.innerHTML = `
        <div class="titulo-cartao-meta">Meta de renda mensal</div>
        <div class="valor-cartao-meta valor-sensivel">R$ ${formatarMoeda(rendaMensalAtual)}</div>
        <div class="texto-meta-secundario">
            ${progressoMetaRenda.atingida
                ? 'Meta atingida'
                : `Faltam R$ ${formatarMoeda(progressoMetaRenda.faltante)}`}
        </div>
        <div class="barra-progresso-meta">
            <div class="preenchimento-barra-meta" style="width:${progressoMetaRenda.percentual}%"></div>
        </div>
        <div class="texto-meta-secundario">${progressoMetaRenda.percentual.toFixed(1)}% concluído</div>
    `;
}
