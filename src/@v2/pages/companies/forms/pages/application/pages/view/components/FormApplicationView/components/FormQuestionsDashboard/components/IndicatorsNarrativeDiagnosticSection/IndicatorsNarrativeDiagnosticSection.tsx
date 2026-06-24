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
import { useFetchIndicatorsNarrativeDiagnostic } from '@v2/services/forms/indicators-narrative-diagnostic/hooks/useFetchIndicatorsNarrativeDiagnostic';
import { getIndicatorsNarrativeDiagnosticQueryKey } from '@v2/services/forms/indicators-narrative-diagnostic/hooks/useMutateGenerateIndicatorsNarrativeDiagnostic';
import { useMutateGenerateIndicatorsNarrativeDiagnostic } from '@v2/services/forms/indicators-narrative-diagnostic/hooks/useMutateGenerateIndicatorsNarrativeDiagnostic';
import type { IndicatorsNarrativeDiagnosticScope } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.types';
import { readIndicatorsNarrativeDiagnostic } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.service';
import {
  buildIndicatorsNarrativeDiagnosticScopeKey,
  diagnosticMatchesViewMode,
  normalizeIndicatorsNarrativeScope,
} from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.scope';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getIndicatorsNarrativeDiagnosticErrorMessage } from './indicators-narrative-diagnostic.utils';
import { IndicatorsNarrativeMarkdown } from './IndicatorsNarrativeMarkdown';

type IndicatorsNarrativeDiagnosticSectionProps = {
  companyId: string;
  formApplicationId: string;
  scope: IndicatorsNarrativeDiagnosticScope;
  isMaster?: boolean;
};

export const IndicatorsNarrativeDiagnosticSection = ({
  companyId,
  formApplicationId,
  scope,
  isMaster,
}: IndicatorsNarrativeDiagnosticSectionProps) => {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});
  const normalizedScope = normalizeIndicatorsNarrativeScope(scope);
  const scopeKey = buildIndicatorsNarrativeDiagnosticScopeKey(normalizedScope);
  const scopeQueryKey = [
    ...getIndicatorsNarrativeDiagnosticQueryKey(companyId, formApplicationId),
    scopeKey,
  ] as const;

  const {
    indicatorsNarrativeDiagnostic,
    isProcessing,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useFetchIndicatorsNarrativeDiagnostic({
    companyId,
    formApplicationId,
    scope: normalizedScope,
  });

  const { mutateAsync: generateDiagnostic, isPending: isGenerating } =
    useMutateGenerateIndicatorsNarrativeDiagnostic();

  const promptKeyForMode = normalizedScope.showOnlyGroupIndicators
    ? SystemAiPromptKeyEnum.INDICATORS_NARRATIVE_DIAGNOSTIC_GROUPS_ONLY
    : SystemAiPromptKeyEnum.INDICATORS_NARRATIVE_DIAGNOSTIC_GROUPS_AND_QUESTIONS;

  const diagnosticForScope =
    diagnosticMatchesViewMode(
      indicatorsNarrativeDiagnostic,
      normalizedScope.showOnlyGroupIndicators,
    )
      ? indicatorsNarrativeDiagnostic
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
    const isConsolidated = normalizedScope.showOnlyGroupIndicators;
    const message = regenerate
      ? 'Já existe um diagnóstico salvo para este recorte. Deseja substituir o diagnóstico atual?'
      : isConsolidated
        ? 'Esta ação enviará os indicadores consolidados (construtos/sessões) do recorte para IA e poderá consumir créditos. Deseja continuar?'
        : 'Esta ação enviará os indicadores consolidados e as perguntas visíveis do recorte para IA e poderá consumir créditos. Deseja continuar?';

    const confirmed = await showConfirmation({
      title: regenerate
        ? isConsolidated
          ? 'Regerar diagnóstico consolidado'
          : 'Regerar diagnóstico completo'
        : isConsolidated
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
      companyId,
      formApplicationId,
      scope: normalizedScope,
      regenerate,
      ...masterOverrides,
    };

    try {
      console.info('[Indicators Narrative Diagnostic] Starting generation', {
        formApplicationId,
        scopeKey,
        scope: normalizedScope,
        regenerate,
        hasCustomPrompt: Boolean(isMaster && customPrompt?.trim()),
        model: isMaster ? model ?? null : null,
      });

      const generated = await generateDiagnostic(payload);
      queryClient.setQueryData(scopeQueryKey, generated);
      enqueueSnackbar('Diagnóstico iniciado com sucesso.', {
        variant: 'success',
      });
      void refetch();
      return true;
    } catch (error) {
      const responseStatus = Number(
        (error as { response?: { status?: number } })?.response?.status,
      );
      const messageFromApi =
        typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data
          ?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response!.data!.message
          : null;

      if (responseStatus === 409) {
        enqueueSnackbar(
          messageFromApi ??
            'Já existe diagnóstico para este recorte. Sincronizando estado da tela…',
          { variant: 'warning' },
        );

        let existing = await readIndicatorsNarrativeDiagnostic({
          companyId,
          formApplicationId,
          scope: normalizedScope,
        });

        if (!existing) {
          const sync = await refetch();
          existing = sync.data ?? null;
        }

        if (existing) {
          queryClient.setQueryData(scopeQueryKey, existing);
          enqueueSnackbar('Diagnóstico existente carregado para o recorte atual.', {
            variant: 'info',
          });
          return false;
        }

        const shouldRegenerate = await showConfirmation({
          title: 'Diagnóstico já existente',
          message:
            'Há um diagnóstico salvo neste recorte (o servidor retornou conflito), mas a leitura não trouxe o registro para exibição. Deseja forçar a regeração agora?',
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

      console.error('[Indicators Narrative Diagnostic] Failed to start generation', {
        formApplicationId,
        scope: normalizedScope,
        regenerate,
        error,
      });

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

  useEffect(() => {
    if (!isError) return;
    const message =
      typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data
        ?.message === 'string'
        ? (error as { response?: { data?: { message?: string } } }).response!.data!.message
        : 'Falha ao carregar o diagnóstico narrativo deste recorte.';

    enqueueSnackbar(message, { variant: 'error' });
  }, [enqueueSnackbar, error, isError]);

  return (
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
            Síntese em texto dos indicadores de qualidade do recorte atual (construtos/sessões
            e, quando aplicável, perguntas). A geração só ocorre quando você solicitar.
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
          Não foi possível carregar o diagnóstico narrativo deste recorte. Tente atualizar
          a página ou gerar novamente.
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
          Nenhum diagnóstico gerado para este recorte. Use o botão acima para criar um.
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
              ? 'Prompt padrão do diagnóstico consolidado (Indicadores)'
              : 'Prompt padrão do diagnóstico completo com perguntas (Indicadores)'
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
  );
};
