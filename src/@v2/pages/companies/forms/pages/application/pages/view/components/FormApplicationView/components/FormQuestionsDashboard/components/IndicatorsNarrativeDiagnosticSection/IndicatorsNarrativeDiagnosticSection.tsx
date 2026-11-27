import { FRPS_GENERATION_DEFAULT_MODEL, FRPS_GENERATION_MODEL_OPTIONS } from '../FormRisksAnalysis/frps-generation-model-options';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { formAccordionNavigationSx } from '../../../form-accordion-navigation.styles';
import { Alert, Box, CircularProgress, Skeleton } from '@mui/material';
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
import { readIndicatorsNarrativeDiagnostic } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.service';
import {
  buildIndicatorsNarrativeDiagnosticScopeKey,
  diagnosticMatchesScope,
  CAMPAIGN_INDICATORS_SCOPE,
} from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.scope';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getIndicatorsNarrativeDiagnosticErrorMessage } from './indicators-narrative-diagnostic.utils';
import { IndicatorsNarrativeMarkdown } from './IndicatorsNarrativeMarkdown';

type IndicatorsNarrativeDiagnosticSectionProps = {
  companyId: string;
  formApplicationId: string;
  isMaster?: boolean;
};

export const IndicatorsNarrativeDiagnosticSection = ({
  companyId,
  formApplicationId,
  isMaster,
}: IndicatorsNarrativeDiagnosticSectionProps) => {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>(
    {},
  );
  const normalizedScope = CAMPAIGN_INDICATORS_SCOPE;
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

  const promptKeyForMode = SystemAiPromptKeyEnum.INDICATORS_NARRATIVE_DIAGNOSTIC_GROUPS_AND_QUESTIONS;
  const diagnosticForScope = diagnosticMatchesScope(indicatorsNarrativeDiagnostic, normalizedScope)
    ? indicatorsNarrativeDiagnostic : null;
  const status = diagnosticForScope?.status;
  const hasSavedDiagnostic = Boolean(diagnosticForScope?.contentMarkdown?.trim());
  const isDone = status === FormAiAnalysisStatusEnum.DONE && hasSavedDiagnostic;
  const isFailed = status === FormAiAnalysisStatusEnum.FAILED;
  const generateButtonLabel = hasSavedDiagnostic ? 'Regerar diagnóstico geral com IA' : 'Gerar diagnóstico geral com IA';

  const handleGenerateCommon = async ({
    regenerate,
    customPrompt,
    model,
  }: {
    regenerate: boolean;
    customPrompt?: string;
    model?: string;
  }): Promise<boolean> => {
    const confirmed = await showConfirmation({
      title: regenerate ? 'Substituir diagnóstico geral' : 'Gerar diagnóstico geral com IA',
      message: regenerate
        ? 'Já existe um diagnóstico geral salvo. Esta ação fará uma nova análise da campanha completa, com escalas, dimensões cadastradas e perguntas, independentemente dos filtros da tela, e substituirá o texto anterior após a conclusão. Não há histórico de versões. Poderá consumir créditos. Deseja continuar?'
        : 'Esta ação analisará a campanha completa, com todas as escalas, dimensões cadastradas e perguntas, independentemente dos filtros e das opções de visualização da tela. O diagnóstico ficará salvo para consulta e poderá consumir créditos. Deseja continuar?',
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
        model: isMaster ? (model ?? null) : null,
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
        typeof (error as { response?: { data?: { message?: unknown } } })
          ?.response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response!
              .data!.message
          : null;

      if (responseStatus === 409) {
        enqueueSnackbar(
          messageFromApi ??
            'Já existe diagnóstico para esta campanha. Sincronizando estado da tela…',
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
          enqueueSnackbar(
            'Diagnóstico existente carregado para o campanha.',
            {
              variant: 'info',
            },
          );
          return false;
        }

        return false;
      }

      console.error(
        '[Indicators Narrative Diagnostic] Failed to start generation',
        {
          formApplicationId,
          scope: normalizedScope,
          regenerate,
          status: responseStatus || undefined,
        },
      );

      enqueueSnackbar(
        messageFromApi ??
          'Não foi possível iniciar o diagnóstico com IA. Tente novamente.',
        { variant: 'error' },
      );
      return false;
    }
  };

  const handleGenerate = async (regenerate: boolean) => {
    const masterOverrides = buildMasterAiRequestOverrides(
      isMaster,
      aiMasterConfig,
    );
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
      typeof (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message === 'string'
        ? (error as { response?: { data?: { message?: string } } }).response!
            .data!.message
        : 'Falha ao carregar o diagnóstico narrativo desta campanha.';

    enqueueSnackbar(message, { variant: 'error' });
  }, [enqueueSnackbar, error, isError]);

  return (
    <Box>
      <SAccordion
        defaultExpanded={false}
        title="Diagnóstico narrativo com IA"
        subtitle="Análise geral da campanha completa: escalas, dimensões e perguntas. Independente dos filtros da tela."
        icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 30 }} />}
        expandIcon={<ChevronRightIcon fontSize="small" />}
        color="text.primary"
        fontWeight="600"
        accordionProps={{
          sx: (theme) => ({
            ...formAccordionNavigationSx,
            p: 0,
            border: 0,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&::before': { display: 'none' },
            '&& .MuiAccordionSummary-root:not(.Mui-expanded)': {
              minHeight: '48px !important',
              padding: '8px 12px !important',
              gap: 4,
              borderRadius: '24px',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.045)'
                : 'rgba(255, 255, 255, 0.45)',
              '&:hover': { backgroundColor: 'action.hover' },
            },
            '&& .MuiAccordionSummary-root.Mui-expanded': {
              border: 0,
              borderBottom: '1px solid',
              borderColor: 'divider',
              borderRadius: 0,
              backgroundColor: 'transparent',
            },
            '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 4 },
            '& .MuiAccordionSummary-content > :first-child': {
              width: 36, height: 36, flexShrink: 0, mr: 0,
            },
          }),
        }}
      >
        <Box sx={{ px: 6, pt: 6, pb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 6,
            '& > div': { flexWrap: 'nowrap', maxWidth: '100%' },
            '& .MuiIconButton-root': { flexShrink: 0 },
            '& .MuiButton-startIcon': { color: 'primary.main' },
          }}>
            <AiActionButtonGroup
              variant="mui-outlined"
              label={generateButtonLabel}
              loading={isGenerating}
              disabled={showProcessing || isGenerating}
              onExecute={() => void handleGenerate(hasSavedDiagnostic)}
              onConfigure={() => setAiConfigDialogOpen(true)}
              configureIconOnly
              isMaster={isMaster}
              sButtonProps={{ buttonProps: { sx: {
                color: 'text.primary', borderColor: 'divider', borderRadius: '999px',
                backgroundColor: 'transparent', minWidth: 0, whiteSpace: 'normal',
                '&:hover': { backgroundColor: 'action.hover', borderColor: 'text.secondary' },
              } } }}
            />
          </Box>

          {isLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : isError ? (
            <Alert severity="error">
              Não foi possível carregar o diagnóstico narrativo desta campanha. Tente
              atualizar a página ou gerar novamente.
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
                  onClick={() => void handleGenerate(hasSavedDiagnostic)}
                />
              }
            >
              {getIndicatorsNarrativeDiagnosticErrorMessage(
                diagnosticForScope?.metadata,
                isMaster,
              )}
            </Alert>
          ) : isDone && diagnosticForScope?.contentMarkdown ? (
            <IndicatorsNarrativeMarkdown
              content={diagnosticForScope.contentMarkdown}
            />
          ) : (
            <SText fontSize={14} color="text.secondary">
              Nenhum diagnóstico geral salvo para esta campanha. Use o botão acima para gerar uma análise da campanha completa.
            </SText>
          )}

          {!isDone && hasSavedDiagnostic && diagnosticForScope?.contentMarkdown && (
            <Box sx={{ mt: 6 }}>
              <SText color="text.secondary" fontSize={13} mb={4}>Último diagnóstico geral concluído — preservado enquanto a nova análise não for concluída.</SText>
              <IndicatorsNarrativeMarkdown content={diagnosticForScope.contentMarkdown} />
            </Box>
          )}
          {isDone && diagnosticForScope && (
            <SText color="text.secondary" fontSize={12} mt={6}>
              Diagnóstico geral salvo em {new Date(diagnosticForScope.updatedAt).toLocaleString('pt-BR')}. Os filtros da tela não alteram este texto.
            </SText>
          )}
        </Box>
      </SAccordion>

      {isMaster && (
        <SystemAiPromptConfigDialog
          open={aiConfigDialogOpen}
          onClose={() => setAiConfigDialogOpen(false)}
          onApply={setAiMasterConfig}
          initialConfig={aiMasterConfig}
          defaultModelValue={FRPS_GENERATION_DEFAULT_MODEL}
          modelOptions={FRPS_GENERATION_MODEL_OPTIONS}
          promptKey={promptKeyForMode}
          title="Configurar diagnóstico geral de Indicadores"
          promptLabel="Orientação do diagnóstico geral (escalas, dimensões e perguntas)"
          modelLabel="Modelo de IA (opcional)"
          modelPlaceholder="Padrão: GPT-6.1 Sol (gpt-6.1-sol)"
          saveDefaultConfirmMessage="O conteúdo atual será salvo como prompt padrão para o diagnóstico narrativo de indicadores. Deseja continuar?"
          promptMinRows={5}
          promptMaxRows={30}
        />
      )}
    </Box>
  );
};
