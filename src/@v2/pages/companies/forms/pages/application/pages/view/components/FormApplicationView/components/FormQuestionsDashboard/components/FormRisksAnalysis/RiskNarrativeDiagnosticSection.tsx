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
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetchRiskNarrativeDiagnostic } from '@v2/services/forms/risk-narrative-diagnostic/hooks/useFetchRiskNarrativeDiagnostic';
import { useMutateGenerateRiskNarrativeDiagnostic } from '@v2/services/forms/risk-narrative-diagnostic/hooks/useMutateGenerateRiskNarrativeDiagnostic';
import type { RiskNarrativeDiagnosticScope } from '@v2/services/forms/risk-narrative-diagnostic/service/risk-narrative-diagnostic.types';
import { useEffect, useMemo, useState } from 'react';

import { getRiskNarrativeDiagnosticErrorMessage } from './risk-narrative-diagnostic.utils';
import { RiskNarrativeMarkdown } from './RiskNarrativeMarkdown';

type RiskNarrativeDiagnosticSectionProps = {
  companyId: string;
  formApplicationId: string;
  scope: RiskNarrativeDiagnosticScope;
  isMaster?: boolean;
};

function buildNarrativeExpandedStorageKey(
  companyId: string,
  formApplicationId: string,
  scope: RiskNarrativeDiagnosticScope,
) {
  return [
    'frps-risk-narrative-expanded',
    companyId,
    formApplicationId,
    scope.groupingQuestionId ?? '',
    (scope.participantGroupIds || []).join(','),
    (scope.allowedHierarchyIds || []).join(','),
    scope.groupingLabel ?? '',
  ].join(':');
}

function useSessionExpandedState(storageKey: string, defaultExpanded = false) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return defaultExpanded;
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored === null) return defaultExpanded;
      return stored === 'true';
    } catch {
      return defaultExpanded;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(storageKey, String(expanded));
    } catch {
      // ignore quota / private mode
    }
  }, [expanded, storageKey]);

  return [expanded, setExpanded] as const;
}

export const RiskNarrativeDiagnosticSection = ({
  companyId,
  formApplicationId,
  scope,
  isMaster,
}: RiskNarrativeDiagnosticSectionProps) => {
  const { showConfirmation } = useConfirmationModal();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});

  const storageKey = useMemo(
    () => buildNarrativeExpandedStorageKey(companyId, formApplicationId, scope),
    [companyId, formApplicationId, scope],
  );
  const [expanded, setExpanded] = useSessionExpandedState(storageKey, false);

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
    <Box sx={{ mx: 8, mb: 4 }}>
      <SAccordion
        expanded={expanded}
        onChange={(_, nextExpanded) => setExpanded(nextExpanded)}
        title={
          <SText fontSize={16} fontWeight="bold" component="span">
            Diagnóstico narrativo com IA
          </SText>
        }
        subtitle={
          <SText fontSize={13} color="text.secondary" component="span">
            Síntese em texto do recorte atual da análise de riscos (matriz, níveis e
            análises já concluídas). A geração só ocorre quando você solicitar.
          </SText>
        }
        endComponent={
          <Box
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            sx={{ ml: 'auto', mr: 1, flexShrink: 0 }}
          >
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
          </Box>
        }
        accordionProps={{
          disableGutters: true,
          TransitionProps: { unmountOnExit: true },
          sx: {
            border: '1px solid',
            borderColor: 'grey.200',
            bgcolor: 'grey.50',
            borderRadius: 1,
            boxShadow: 'none',
            '&:before': { display: 'none' },
            overflow: 'hidden',
            '& .MuiAccordionSummary-root': {
              px: 3,
              py: 1.5,
              minHeight: 0,
              alignItems: 'center',
              gap: 1,
            },
            '& .MuiAccordionSummary-content': {
              my: 1,
              mr: 1,
              flexGrow: 1,
              minWidth: 0,
            },
            '& .MuiAccordionDetails-root': {
              px: 3,
              pb: 3,
              pt: 0,
            },
          },
        }}
      >
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
            Nenhum diagnóstico gerado para este recorte. Use o botão no cabeçalho
            para criar um.
          </SText>
        )}
      </SAccordion>

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
