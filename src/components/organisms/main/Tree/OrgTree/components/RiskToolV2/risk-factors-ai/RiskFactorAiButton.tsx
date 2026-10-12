import React from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SIconButton from 'components/atoms/SIconButton';

import {
  RiskFactorAiField,
} from './risk-factors-ai-scope.util';
import { useRiskFactorsAiOptional } from './RiskFactorsAiProvider';

const FIELD_TOOLTIP: Record<RiskFactorAiField, string> = {
  generateSource: 'Sugestão de IA para fonte geradora',
  existingEngineeringMeasures: 'Sugestão de IA para EPC/ENG existente',
  existingAdministrativeMeasures: 'Sugestão de IA para medida administrativa existente',
  recommendedEngineeringMeasures: 'Sugestão de IA para recomendação de engenharia',
  recommendedAdministrativeMeasures: 'Sugestão de IA para recomendação administrativa',
};

export function RiskFactorFieldAiButton({
  riskId,
  riskName,
  field,
}: {
  riskId?: string;
  riskName?: string;
  field: RiskFactorAiField;
}) {
  const ai = useRiskFactorsAiOptional();
  if (!ai || !riskId) return null;

  return (
    <SIconButton
      size="small"
      tooltip={FIELD_TOOLTIP[field]}
      aria-label={FIELD_TOOLTIP[field]}
      sx={{ p: 0.25 }}
      onClick={(event) => {
        event.stopPropagation();
        ai.openField({ riskId, riskName, field });
      }}
    >
      <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
    </SIconButton>
  );
}

export function RiskFactorRiskAiButton({
  riskId,
  riskName,
}: {
  riskId?: string;
  riskName?: string;
}) {
  const ai = useRiskFactorsAiOptional();
  if (!ai || !riskId) return null;

  return (
    <SIconButton
      size="small"
      tooltip="Sugestões de IA para este risco"
      aria-label="Sugestões de IA para este risco"
      sx={{ p: 0.25 }}
      onClick={(event) => {
        event.stopPropagation();
        ai.openRisk({ riskId, riskName });
      }}
    >
      <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
    </SIconButton>
  );
}
