import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

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
import { getIndicatorsNarrativeDiagnosticErrorMessage } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/IndicatorsNarrativeDiagnosticSection/indicators-narrative-diagnostic.utils';
import { IndicatorsNarrativeMarkdown } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/IndicatorsNarrativeDiagnosticSection/IndicatorsNarrativeMarkdown';
import { useFetchConsolidatedViewIndicatorsNarrativeDiagnostic } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewIndicatorsNarrativeDiagnostic';
import {
  getConsolidatedIndicatorsNarrativeDiagnosticQueryKey,
  useMutateGenerateConsolidatedViewIndicatorsNarrativeDiagnostic,
} from '@v2/services/enterprise/company-group/consolidated-view/hooks/useMutateGenerateConsolidatedViewIndicatorsNarrativeDiagnostic';
import {
  buildConsolidatedIndicatorsNarrativeScopeKey,
  consolidatedNarrativeMatchesViewMode,
  normalizeConsolidatedIndicatorsNarrativeScope,
} from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.scope';
import { readConsolidatedIndicatorsNarrativeDiagnostic } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.service';
import { ConsolidatedIndicatorsNarrativeScope } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-narrative.types';

type Props = {
  companyGroupId: number;
  applicationIds: string[];
  scope: ConsolidatedIndicatorsNarrativeScope;
  isMaster?: boolean;
};

export function buildConsolidatedNarrativePdfSnapshot(params: {
  scope: ConsolidatedIndicatorsNarrativeScope;
  businessGroupName?: string;
  contentMarkdown?: string | null;
  status?: FormAiAnalysisStatusEnum;
  scopeKey?: string;
}) {
  return {
    mode: 'virtual_consolidated_narrative',
    businessGroupName: params.businessGroupName ?? null,
    scope: params.scope,
    scopeKey: params.scopeKey ?? null,
    status: params.status ?? null,
    contentMarkdown: params.contentMarkdown ?? null,
  };
}

export function FormConsolidatedNarrativeSection({
  companyGroupId,
  applicationIds,
  scope,
  isMaster,
}: Props) {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});

  const normalizedScope = useMemo(
    () => normalizeConsolidatedIndicatorsNarrativeScope(scope),
    [scope],
  );

  const scopeKey = buildConsolidatedIndicatorsNarrativeScopeKey(normalizedScope, {
    companyGroupId,
    applicationIds,
  });

  const scopeQueryKey = [
    ...getConsolidatedIndicatorsNarrativeDiagnosticQueryKey(
      companyGroupId,
      applicationIds,
    ),
    scopeKey,
  ] as const;

  const {
    narrativeDiagnostic,
    isProcessing,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFetchConsolidatedViewIndicatorsNarrativeDiagnostic({
    companyGroupId,
    applicationIds,
    scope: normalizedScope,
  });

  const { mutateAsync: generateDiagnostic, isPending: isGenerating } =
    useMutateGenerateConsolidatedViewIndicatorsNarrativeDiagnostic();

  const promptKeyForMode = normalizedScope.showOnlyGroupIndicators
    ? SystemAiPromptKeyEnum.INDICATORS_NARRATIVE_DIAGNOSTIC_GROUPS_ONLY
    : SystemAiPromptKeyEnum.INDICATORS_NARRATIVE_DIAGNOSTIC_GROUPS_AND_QUESTIONS;

  const diagnosticForScope = consolidatedNarrativeMatchesViewMode(
    narrativeDiagnostic,
    normalizedScope.showOnlyGroupIndicators,
  )
    ? narrativeDiagnostic
    : null;

  const status = diagnosticForScope?.status;
  const isDone =
    status === FormAiAnalysisStatusEnum.DONE &&
    Boolean(diagnosticForScope?.contentMarkdown?.trim());
  const isFailed = status === FormAiAnalysisStatusEnum.FAILED;

  const generateButtonLabel = normalizedScope.showOnlyGroupIndicators
    ? isDone
      ? 'Regerar diagnóstico consolidado com IA'
      : 'Gerar diagnóstico consolidado com IA'
    : isDone
      ? 'Regerar diagnóstico completo com IA'
      : 'Gerar diagnóstico completo com IA';

  const handleGenerateCommon = async ({
    regenerate,
    customPrompt,
    model,
  }: {
    regenerate: boolean;
    customPrompt?: string;
    model?: string;
  }): Promise<boolean> => {
    const isGroupOnly = normalizedScope.showOnlyGroupIndicators;
    const message = regenerate
      ? 'Já existe um diagnóstico salvo para este agrupamento. Deseja substituir o diagnóstico atual?'
      : isGroupOnly
        ? 'Esta ação enviará os indicadores consolidados (construtos/sessões) exibidos neste agrupamento para IA e poderá consumir créditos. Deseja continuar?'
        : 'Esta ação enviará os indicadores consolidados e as perguntas visíveis deste agrupamento para IA e poderá consumir créditos. Deseja continuar?';

    const confirmed = await showConfirmation({
      title: regenerate
        ? isGroupOnly
          ? 'Regerar diagnóstico consolidado'
          : 'Regerar diagnóstico completo'
        : isGroupOnly
          ? 'Gerar diagnóstico consolidado com IA'
          : 'Gerar diagnóstico completo com IA',
      message,
      confirmText: regenerate ? 'Substituir' : 'Continuar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return false;

    const masterOverrides = buildMasterAiRequestOverrides(isMaster, {
      customPrompt,
      model,
    });

    const payload = {
      companyGroupId,
      applicationIds,
      scope: normalizedScope,
      regenerate,
      ...masterOverrides,
    };

    try {
      const generated = await generateDiagnostic(payload);
      queryClient.setQueryData(scopeQueryKey, generated);
      enqueueSnackbar('Diagnóstico iniciado com sucesso.', {
        variant: 'success',
      });
      void refetch();
      return true;
    } catch (generateError) {
      const responseStatus = Number(
        (generateError as { response?: { status?: number } })?.response?.status,
      );
      const messageFromApi =
        typeof (generateError as { response?: { data?: { message?: unknown } } })
          ?.response?.data?.message === 'string'
          ? (generateError as { response?: { data?: { message?: string } } })
              .response!.data!.message
          : null;

      if (responseStatus === 409) {
        enqueueSnackbar(
          messageFromApi ??
            'Já existe diagnóstico para este agrupamento. Sincronizando estado da tela…',
          { variant: 'warning' },
        );

        let existing = await readConsolidatedIndicatorsNarrativeDiagnostic({
          companyGroupId,
          applicationIds,
          scope: normalizedScope,
        });

        if (!existing) {
          const sync = await refetch();
          existing = sync.data ?? null;
        }

        if (existing) {
          queryClient.setQueryData(scopeQueryKey, existing);
          enqueueSnackbar('Diagnóstico existente carregado para o agrupamento atual.', {
            variant: 'info',
          });
          return false;
        }

        const shouldRegenerate = await showConfirmation({
          title: 'Diagnóstico já existente',
          message:
            'Há um diagnóstico salvo neste agrupamento (o servidor retornou conflito), mas a leitura não trouxe o registro para exibição. Deseja forçar a regeração agora?',
          confirmText: 'Regerar',
          cancelText: 'Cancelar',
          variant: 'warning',
        });

        if (!shouldRegenerate) return false;

        const regenerated = await generateDiagnostic({
          ...payload,
          regenerate: true,
        });
        queryClient.setQueryData(scopeQueryKey, regenerated);
        enqueueSnackbar('Regeração iniciada com sucesso.', { variant: 'success' });
        void refetch();
        return true;
      }

      enqueueSnackbar(
        messageFromApi ??
          'Não foi possível iniciar o diagnóstico com IA. Tente novamente.',
        { variant: 'error' },
      );
      return false;
    }
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

  const pdfSnapshot = buildConsolidatedNarrativePdfSnapshot({
    scope: normalizedScope,
    businessGroupName: diagnosticForScope?.businessGroupName,
    contentMarkdown: diagnosticForScope?.contentMarkdown,
    status: diagnosticForScope?.status,
    scopeKey: diagnosticForScope?.scopeKey,
  });

  useEffect(() => {
    if (!isError) return;
    const message =
      typeof (error as { response?: { data?: { message?: unknown } } })?.response
        ?.data?.message === 'string'
        ? (error as { response?: { data?: { message?: string } } }).response!.data!
            .message
        : 'Falha ao carregar o diagnóstico narrativo deste agrupamento.';

    enqueueSnackbar(message, { variant: 'error' });
  }, [enqueueSnackbar, error, isError]);

  return (
    <>
      <Box
        sx={{
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
              Síntese em texto dos indicadores de qualidade exibidos neste
              agrupamento consolidado (construtos/sessões e, quando aplicável,
              perguntas). A geração só ocorre quando você solicitar.
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
        ) : isError ? (
          <Alert severity="error">
            Não foi possível carregar o diagnóstico narrativo deste agrupamento.
            Tente atualizar a página ou gerar novamente.
          </Alert>
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
            {getIndicatorsNarrativeDiagnosticErrorMessage(
              diagnosticForScope?.metadata,
              isMaster,
            )}
          </Alert>
        ) : isDone && diagnosticForScope?.contentMarkdown ? (
          <IndicatorsNarrativeMarkdown content={diagnosticForScope.contentMarkdown} />
        ) : (
          <SText fontSize={14} color="text.secondary">
            Nenhum diagnóstico gerado para este agrupamento. Use o botão acima para
            criar um.
          </SText>
        )}

      {isMaster && (
        <SystemAiPromptConfigDialog
          open={aiConfigDialogOpen}
          onClose={() => setAiConfigDialogOpen(false)}
          onApply={setAiMasterConfig}
          promptKey={promptKeyForMode}
          title={
            normalizedScope.showOnlyGroupIndicators
              ? 'Prompt padrão do diagnóstico consolidado (Indicadores — visão consolidada)'
              : 'Prompt padrão do diagnóstico completo com perguntas (Indicadores — visão consolidada)'
          }
          promptLabel={
            normalizedScope.showOnlyGroupIndicators
              ? 'Prompt padrão do diagnóstico consolidado'
              : 'Prompt padrão do diagnóstico completo com perguntas'
          }
          modelLabel="Modelo de IA (opcional)"
          modelPlaceholder="Use o padrão configurado no backend"
          saveDefaultConfirmMessage="O conteúdo atual será salvo como prompt padrão para o diagnóstico narrativo de indicadores. Deseja continuar?"
          promptMinRows={5}
          promptMaxRows={30}
        />
      )}
      </Box>

      <Box
        aria-hidden
        sx={{ display: 'none' }}
        data-consolidated-narrative-pdf-snapshot={JSON.stringify(pdfSnapshot)}
      />
    </>
  );
}
