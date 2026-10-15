import React from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Box, Tooltip } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import SText from 'components/atoms/SText';

import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { RecTypeEnum } from 'project/enum/recType.enum';

import {
  RiskFactorAiColumn,
  RiskFactorAiPendingAction,
} from './risk-factor-ai-pending.util';
import { useRiskFactorsAiOptional } from './RiskFactorsAiProvider';
import { RiskFactorAiRowRiskData } from './useRiskFactorAiSuggestionActions';

const ACTION_LABEL: Record<Exclude<RiskFactorAiPendingAction, 'approve-probability'>, string> = {
  add: 'Adicionar',
  'confirm-existence': 'Confirmar que existe',
  'accept-recommendation': 'Aceitar recomendação',
};

function actionLabel(action: RiskFactorAiPendingAction, value: string): string {
  if (action === 'approve-probability') return `Aprovar P${value}`;
  return ACTION_LABEL[action];
}

/** Rótulo do tipo de ação no cartão pendente (mesmo espaço visual; sem linha extra). */
function pendingKindLabel(
  action: RiskFactorAiPendingAction,
  value: string,
): string {
  if (action === 'approve-probability') return `Aprovar P${value}`;
  if (action === 'confirm-existence') return 'Confirmar que existe';
  if (action === 'accept-recommendation') return 'Aceitar recomendação';
  return 'pendente';
}

const REC_TYPE_LABEL: Partial<Record<RecTypeEnum, string>> = {
  [RecTypeEnum.ENG]: 'Engenharia',
  [RecTypeEnum.ADM]: 'Administrativa',
};

export function RiskFactorAiPendingList({
  column,
  riskId,
  riskData,
  handleSelect,
  readOnly = false,
}: {
  column: RiskFactorAiColumn;
  riskId?: string;
  riskData?: RiskFactorAiRowRiskData | null;
  handleSelect: (values: Partial<IUpsertRiskData>) => Promise<void> | void;
  readOnly?: boolean;
}) {
  const ai = useRiskFactorsAiOptional();
  const actions = ai?.suggestions;
  if (!actions || !riskData) return null;

  const items = actions.pendingFor({ riskId, column, riskData });
  if (!items.length) return null;

  return (
    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {items.map((item) => {
        const applying = actions.applyingKey === item.key;
        const busy = !!actions.applyingKey;
        return (
          <Box
            key={item.key}
            data-testid="risk-factor-ai-pending-item"
            sx={{
              border: '1px dashed',
              borderColor: 'info.main',
              borderRadius: 1,
              px: 1,
              py: 0.75,
              backgroundColor: 'transparent',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 12, color: 'info.main' }} />
              <SText fontSize={10} color="info.main">
                Sugestão da IA · {pendingKindLabel(item.action, item.value)}
                {item.recType && REC_TYPE_LABEL[item.recType]
                  ? ` · ${REC_TYPE_LABEL[item.recType]}`
                  : ''}
              </SText>
            </Box>
            <Tooltip title={item.rationale || ''} placement="top" disableInteractive>
              <span>
                <SText fontSize={12} sx={{ wordBreak: 'break-word' }}>
                  {item.action === 'approve-probability'
                    ? `Probabilidade sugerida pela IA: ${item.value}`
                    : item.value}
                </SText>
              </span>
            </Tooltip>
            {item.action === 'approve-probability' && item.rationale ? (
              <SText fontSize={10} color="text.secondary" sx={{ mt: 0.25 }}>
                {item.rationale}
              </SText>
            ) : null}
            {!readOnly && (
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                <SButton
                  text={actionLabel(item.action, item.value)}
                  variant="outlined"
                  color="info"
                  size="s"
                  loading={applying}
                  disabled={busy}
                  onClick={(event) => {
                    event.stopPropagation();
                    void actions.accept({ suggestion: item, riskData, handleSelect });
                  }}
                  buttonProps={{ sx: { minWidth: 'auto' } }}
                />
                <SButton
                  text="Descartar"
                  variant="text"
                  color="normal"
                  size="s"
                  disabled={applying}
                  onClick={(event) => {
                    event.stopPropagation();
                    actions.dismiss({ suggestion: item, riskData });
                  }}
                  buttonProps={{ sx: { minWidth: 'auto' } }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
