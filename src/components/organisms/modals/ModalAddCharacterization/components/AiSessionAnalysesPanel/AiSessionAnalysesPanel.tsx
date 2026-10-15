import React from 'react';

import { Box } from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

import type { AiSessionAnalysisSummary } from '../../utils/summarize-ai-session-analysis.util';

export const AI_SESSION_ANALYSES_EMPTY_MESSAGE =
  'Nenhuma análise disponível nesta sessão.';

type Props = {
  summary: AiSessionAnalysisSummary;
  /** Rola até o resumo já renderizado no modal (operação local). */
  onViewSummary?: () => void;
  /**
   * Fecha o diálogo e devolve o foco à tabela de fatores.
   * Não chama a API de análise.
   */
  onReturnToTable?: () => void;
};

function formatCountLine(summary: AiSessionAnalysisSummary): string {
  const parts: string[] = [];
  if (summary.pendingReviewCount > 0) {
    parts.push(
      summary.pendingReviewCount === 1
        ? '1 risco com melhorias pendentes'
        : `${summary.pendingReviewCount} riscos com melhorias pendentes`,
    );
  }
  if (summary.pendingNewRiskCount > 0) {
    parts.push(
      summary.pendingNewRiskCount === 1
        ? '1 novo fator sugerido'
        : `${summary.pendingNewRiskCount} novos fatores sugeridos`,
    );
  }
  const accepted =
    summary.acceptedNewRiskCount + summary.acceptedModularCount;
  const discarded =
    summary.discardedNewRiskCount + summary.discardedModularCount;
  if (accepted > 0) {
    parts.push(
      accepted === 1
        ? '1 aceita/confirmada'
        : `${accepted} aceitas/confirmadas`,
    );
  }
  if (discarded > 0) {
    parts.push(
      discarded === 1 ? '1 descartada' : `${discarded} descartadas`,
    );
  }
  if (!parts.length) {
    return 'Análise recuperável nesta sessão. Nenhuma sugestão pendente.';
  }
  return parts.join(' · ');
}

/**
 * Retomada exclusivamente local da análise operacional em sessionStorage.
 * Nenhum botão desta área dispara ai-analyze / OpenAI.
 */
export function AiSessionAnalysesPanel({
  summary,
  onViewSummary,
  onReturnToTable,
}: Props) {
  return (
    <Box
      sx={{
        border: '1px dashed',
        borderColor: 'grey.300',
        borderRadius: 1,
        p: 2,
        backgroundColor: 'grey.50',
      }}
      data-testid="ai-session-analyses-panel"
    >
      <SText variant="subtitle2" color="text.primary" mb={0.5}>
        Análises desta sessão
      </SText>

      {!summary.hasRecoverableAnalysis ? (
        <SText variant="body2" color="text.secondary">
          {AI_SESSION_ANALYSES_EMPTY_MESSAGE}
        </SText>
      ) : (
        <SFlex direction="column" gap={1.5}>
          <SText variant="body2" color="text.secondary">
            Retome a revisão sem executar novamente a IA. Nada é gravado
            automaticamente.
          </SText>
          <SText variant="body2" color="text.primary">
            {formatCountLine(summary)}
          </SText>
          <SFlex direction="row" gap={1} sx={{ flexWrap: 'wrap' }}>
            {onViewSummary && (
              <SButton
                text="Ver resumo"
                variant="outlined"
                color="primary"
                size="s"
                onClick={onViewSummary}
                buttonProps={{ sx: { minWidth: 'auto' } }}
              />
            )}
            {onReturnToTable && (
              <SButton
                text="Continuar na tabela"
                variant="contained"
                color="primary"
                size="s"
                onClick={onReturnToTable}
                buttonProps={{ sx: { minWidth: 'auto' } }}
              />
            )}
          </SFlex>
        </SFlex>
      )}
    </Box>
  );
}
