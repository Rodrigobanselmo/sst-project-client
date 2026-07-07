import { FC } from 'react';

import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';

const PROMPT_KEY = SystemAiPromptKeyEnum.EXAM_RISK_PROMPT_DRAFT;

const VARIABLES_HELP = `Variáveis disponíveis: {{riskName}}, {{riskType}}, {{riskTypeLabel}}, {{riskSubTypes}}, {{riskCas}}, {{riskEsocialCode}}, {{riskIsPcmso}}, {{familyGuidance}}, {{riskTypeDisambiguation}}, {{currentFields}}, {{userGuidance}}, {{outputSchemaSummary}}.`;

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (config: SystemAiMasterConfig) => void;
};

export const ExamRiskAiPromptDraftMasterConfigDialog: FC<Props> = ({
  open,
  onClose,
  onApply,
}) => (
  <SystemAiPromptConfigDialog
    open={open}
    onClose={onClose}
    onApply={onApply}
    promptKey={PROMPT_KEY}
    title="Configurar prompt da geração de campos"
    description={`Altera apenas a qualidade da sugestão de textos e filtros do formulário. Não cria vínculo, não publica na Biblioteca e não roda dry-run automaticamente.\n\n${VARIABLES_HELP}`}
    promptLabel="Prompt-base da geração de campos"
    saveDefaultConfirmMessage="O conteúdo atual será salvo como prompt padrão do sistema para geração de campos do Assistente IA Risco × Exame. Deseja continuar?"
    maxWidth="lg"
    promptMinRows={12}
    promptMaxRows={28}
  />
);
