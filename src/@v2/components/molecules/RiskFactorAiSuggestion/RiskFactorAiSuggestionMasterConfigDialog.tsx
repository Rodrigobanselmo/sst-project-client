import { FC, useMemo } from 'react';

import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import {
  getRiskFactorAiSuggestionTypeLabel,
  getRiskFactorAiSuggestionsDefaultPromptByType,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/risk-factor-ai-suggestions-type.util';

import { SystemAiPromptConfigDialog } from '../SystemAiPromptConfig/SystemAiPromptConfigDialog';
import type { SystemAiMasterConfig } from '../AiActionButtonGroup/system-ai-master-config.types';

export type RiskFactorAiSuggestionMasterConfig = SystemAiMasterConfig;

type RiskFactorAiSuggestionMasterConfigDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (config: RiskFactorAiSuggestionMasterConfig) => void;
  riskType: string;
  promptKey: SystemAiPromptKeyEnum;
};

export const RiskFactorAiSuggestionMasterConfigDialog: FC<
  RiskFactorAiSuggestionMasterConfigDialogProps
> = ({ open, onClose, onApply, riskType, promptKey }) => {
  const factoryDefaultPrompt = useMemo(
    () => getRiskFactorAiSuggestionsDefaultPromptByType(riskType),
    [riskType],
  );
  const typeLabel = useMemo(
    () => getRiskFactorAiSuggestionTypeLabel(riskType),
    [riskType],
  );

  return (
    <SystemAiPromptConfigDialog
      open={open}
      onClose={onClose}
      onApply={onApply}
      promptKey={promptKey}
      factoryDefaultPrompt={factoryDefaultPrompt}
      title={`Configurar Sugestão IA de Fator de Risco ${typeLabel}`}
      description={`Configuração central para fatores de risco ${typeLabel.toLowerCase()} no cadastro e, quando aplicável, no fluxo de métodos de HO.`}
      saveDefaultConfirmMessage={`O conteúdo atual será salvo como prompt padrão do sistema para sugestão IA de fator de risco ${typeLabel.toLowerCase()}. Deseja continuar?`}
    />
  );
};
