import {
  Alert,
  Box,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetchRiskNarrativeDiagnostic } from '@v2/services/forms/risk-narrative-diagnostic/hooks/useFetchRiskNarrativeDiagnostic';
import { useMutateGenerateRiskNarrativeDiagnostic } from '@v2/services/forms/risk-narrative-diagnostic/hooks/useMutateGenerateRiskNarrativeDiagnostic';
import type { RiskNarrativeDiagnosticScope } from '@v2/services/forms/risk-narrative-diagnostic/service/risk-narrative-diagnostic.types';
import { useState } from 'react';

import { getRiskNarrativeDiagnosticErrorMessage } from './risk-narrative-diagnostic.utils';
import { RiskNarrativeMarkdown } from './RiskNarrativeMarkdown';

type RiskNarrativeDiagnosticSectionProps = {
  companyId: string;
  formApplicationId: string;
  scope: RiskNarrativeDiagnosticScope;
  isMaster?: boolean;
};

export const RiskNarrativeDiagnosticSection = ({
  companyId,
  formApplicationId,
  scope,
  isMaster,
}: RiskNarrativeDiagnosticSectionProps) => {
  const { showConfirmation } = useConfirmationModal();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});

  const {
    riskNarrativeDiagnostic,
    isProcessing,
    isLoading,
    isFetching,
    refetch,
  } = useFetchRiskNarrativeDiagnostic({
    companyId,
    formApplicationId,
    scope,
  });

  const { mutate: generateDiagnostic, isPending: isGenerating } =
    useMutateGenerateRiskNarrativeDiagnostic();

  const status = riskNarrativeDiagnostic?.status;
  const isDone =
    status === FormAiAnalysisStatusEnum.DONE &&
    Boolean(riskNarrativeDiagnostic?.contentMarkdown?.trim());
  const isFailed = status === FormAiAnalysisStatusEnum.FAILED;

  const generateButtonLabel = isDone
    ? 'Regerar diagnóstico com IA'
    : 'Gerar diagnóstico com IA';

  const handleGenerateCommon = async ({
    regenerate,
    customPrompt,
    model,
  }: {
    regenerate: boolean;
    customPrompt?: string;
    model?: string;
  }) => {
    const message = regenerate
      ? 'Já existe um diagnóstico salvo para este recorte. Deseja substituir o diagnóstico atual?'
      : 'Esta ação enviará os dados consolidados da análise de riscos para IA e poderá consumir créditos. Deseja continuar?';

    const confirmed = await showConfirmation({
      title: regenerate ? 'Regerar diagnóstico' : 'Gerar diagnóstico com IA',
      message,
      confirmText: regenerate ? 'Substituir' : 'Continuar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    generateDiagnostic(
      {
        companyId,
        formApplicationId,
        scope,
        regenerate,
        ...buildMasterAiRequestOverrides(isMaster, { customPrompt, model }),
      },
      {
        onSuccess: () => {
          void refetch();
        },
      },
    );
  };

  const handleGenerate = async (regenerate: boolean) => {
    const masterOverrides = buildMasterAiRequestOverrides(isMaster, aiMasterConfig);
    await handleGenerateCommon({
      regenerate,
      customPrompt: masterOverrides.customPrompt,
      model: masterOverrides.model,
    });
  };

  const showProcessing =
    isProcessing || status === FormAiAnalysisStatusEnum.PROCESSING;

  return (
    <Box
      sx={{
        mx: 8,
        mb: 4,
        p: 3,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        bgcolor: 'grey.50',
      }}
    >
      <SFlex justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
        <Box>
          <SText fontSize={16} fontWeight="bold">
            Diagnóstico narrativo com IA
          </SText>
          <SText fontSize={13} color="text.secondary" mt={4}>
            Síntese em texto do recorte atual da análise de riscos (matriz, níveis e
            análises já concluídas). A geração só ocorre quando você solicitar.
          </SText>
        </Box>
        <AiActionButtonGroup
          variant="s-button-shade"
          label={generateButtonLabel}
          loading={isGenerating}
          disabled={showProcessing || isGenerating}
          onExecute={() => void handleGenerate(isDone)}
          onConfigure={() => setAiConfigDialogOpen(true)}
          isMaster={isMaster}
          sButtonProps={{ color: 'primary' }}
        />
      </SFlex>

      {isLoading ? (
        <Skeleton variant="rectangular" height={120} />
      ) : showProcessing ? (
        <SFlex alignItems="center" gap={2} py={2}>
          <CircularProgress size={22} />
          <SText fontSize={14} color="text.secondary">
            Gerando diagnóstico narrativo… Isso pode levar alguns minutos.
          </SText>
          {isFetching && !isLoading ? (
            <SText fontSize={12} color="text.disabled">
              (atualizando)
            </SText>
          ) : null}
        </SFlex>
      ) : isFailed ? (
        <Alert
          severity="error"
          action={
            <SButton
              variant="text"
              color="primary"
              text="Tentar novamente"
              disabled={isGenerating}
              onClick={() => void handleGenerate(false)}
            />
          }
        >
          {getRiskNarrativeDiagnosticErrorMessage(
            riskNarrativeDiagnostic?.metadata,
            isMaster,
          )}
        </Alert>
      ) : isDone && riskNarrativeDiagnostic?.contentMarkdown ? (
        <RiskNarrativeMarkdown content={riskNarrativeDiagnostic.contentMarkdown} />
      ) : (
        <SText fontSize={14} color="text.secondary">
          Nenhum diagnóstico gerado para este recorte. Use o botão acima para criar um.
        </SText>
      )}

      {isMaster && (
        <SystemAiPromptConfigDialog
          open={aiConfigDialogOpen}
          onClose={() => setAiConfigDialogOpen(false)}
          onApply={setAiMasterConfig}
          promptKey={SystemAiPromptKeyEnum.RISK_NARRATIVE_DIAGNOSTIC}
          title="Configurar Diagnóstico Narrativo de IA"
          promptLabel="Prompt do diagnóstico"
          modelLabel="Modelo de IA (opcional)"
          modelPlaceholder="Use o padrão configurado no backend"
          saveDefaultConfirmMessage="O conteúdo atual será salvo como prompt padrão para o diagnóstico narrativo com IA. Deseja continuar?"
          promptMinRows={5}
          promptMaxRows={30}
        />
      )}
    </Box>
  );
};
