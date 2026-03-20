import { formatarMoeda, formatarPercentual } from '../services/formatadores.js';
import { converterParaNumeroSeguro } from '../services/calculos-carteira.js';

function montarConteudoCardMeta(progressoMeta, valorAtualReal) {
    const valorMeta = converterParaNumeroSeguro(progressoMeta?.valorMeta, 0);
    const valorRestante = converterParaNumeroSeguro(progressoMeta?.valorRestante, 0);
    const percentualExibicao = Math.max(0, Math.min(100, converterParaNumeroSeguro(progressoMeta?.percentualExibicao, 0)));
    const percentualAtual = converterParaNumeroSeguro(progressoMeta?.percentualAtual, 0);
    const metaConcluida = Boolean(progressoMeta?.metaConcluida);

    if (valorMeta <= 0) {
        return `
            <div class="titulo-cartao-meta">${progressoMeta?.titulo || 'Meta'}</div>
            <div class="valor-cartao-meta">Defina uma meta</div>
            <div class="texto-meta-secundario">
                Valor atual: R$ ${formatarMoeda(converterParaNumeroSeguro(valorAtualReal, 0))}
            </div>
            <div class="barra-progresso-meta">
                <div class="preenchimento-barra-meta" style="width: 0%;"></div>
            </div>
        `;
    }

    return `
        <div class="titulo-cartao-meta">${progressoMeta?.titulo || 'Meta'}</div>
        <div class="valor-cartao-meta">${metaConcluida ? 'Meta concluída' : formatarPercentual(percentualAtual)}</div>
        <div class="texto-meta-secundario">
            Atual: R$ ${formatarMoeda(converterParaNumeroSeguro(valorAtualReal, 0))}
        </div>
        <div class="texto-meta-secundario">
            Meta: R$ ${formatarMoeda(valorMeta)}
        </div>
        <div class="texto-meta-secundario">
            Restante: R$ ${formatarMoeda(valorRestante)}
        </div>
        <div class="barra-progresso-meta">
            <div class="preenchimento-barra-meta" style="width: ${percentualExibicao}%;"></div>
        </div>
    `;
}

export function renderizarCardMetaPatrimonio(
    cardMetaPatrimonio,
    progressoMetaPatrimonio,
    patrimonioAtual
) {
    if (!cardMetaPatrimonio) {
        return;
    }

    cardMetaPatrimonio.innerHTML = montarConteudoCardMeta(
        progressoMetaPatrimonio,
        patrimonioAtual
    );
}

export function renderizarCardMetaRenda(
    cardMetaRenda,
    progressoMetaRenda,
    rendaMensalAtual
) {
    if (!cardMetaRenda) {
        return;
    }

    cardMetaRenda.innerHTML = montarConteudoCardMeta(
        progressoMetaRenda,
        rendaMensalAtual
    );
}