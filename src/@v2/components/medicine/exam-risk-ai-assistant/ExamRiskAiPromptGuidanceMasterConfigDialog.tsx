import { FC } from 'react';

import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';

const PROMPT_KEY = SystemAiPromptKeyEnum.EXAM_RISK_AI_PROMPT_GUIDANCE_DEFAULT;

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (config: SystemAiMasterConfig) => void;
  /** Called after MASTER saves the official SystemAiPrompt default. */
  onOfficialDefaultSaved?: (content: string) => void;
};

/**
 * MASTER config for the session field "Orientação para gerar o prompt".
 * Distinct from EXAM_RISK_PROMPT_DRAFT (prompt-base da geração de campos).
 */
export const ExamRiskAiPromptGuidanceMasterConfigDialog: FC<Props> = ({
  open,
  onClose,
  onApply,
}) => (
  <SystemAiPromptConfigDialog
    open={open}
    onClose={onClose}
    onApply={onApply}
    promptKey={PROMPT_KEY}
    title="Configurar orientação padrão do sistema"
    description="Edita o padrão oficial do campo “Orientação para gerar o prompt” (SystemAiPrompt EXAM_RISK_AI_PROMPT_GUIDANCE_DEFAULT). Não altera o prompt-base da geração de campos (EXAM_RISK_PROMPT_DRAFT). Sessões já editadas pelo usuário não são sobrescritas automaticamente."
    promptLabel="Orientação padrão do sistema"
    saveDefaultConfirmMessage="O conteúdo atual será salvo como orientação padrão oficial do Assistente IA Risco × Exame. Novas sessões carregarão este texto. Deseja continuar?"
    maxWidth="lg"
    promptMinRows={12}
    promptMaxRows={28}
  />
);
