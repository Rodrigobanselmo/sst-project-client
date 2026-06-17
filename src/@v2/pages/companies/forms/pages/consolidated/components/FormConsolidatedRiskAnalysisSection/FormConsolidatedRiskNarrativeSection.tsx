import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import {
  AI_MODEL_OPTIONS,
  AiModelOption,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';
import { getRiskNarrativeDiagnosticErrorMessage } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/risk-narrative-diagnostic.utils';
import { RiskNarrativeMarkdown } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/RiskNarrativeMarkdown';
import { useFetchConsolidatedViewRiskNarrativeDiagnostic } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewRiskNarrativeDiagnostic';
import {
  getConsolidatedRiskNarrativeDiagnosticQueryKey,
  useMutateGenerateConsolidatedViewRiskNarrativeDiagnostic,
} from '@v2/services/enterprise/company-group/consolidated-view/hooks/useMutateGenerateConsolidatedViewRiskNarrativeDiagnostic';
import {
  buildConsolidatedRiskNarrativeScopeKey,
  normalizeConsolidatedRiskNarrativeScope,
} from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.scope';
import { readConsolidatedRiskNarrativeDiagnostic } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.service';
import { ConsolidatedRiskNarrativeScope } from '@v2/services/enterprise/company-group/consolidated-view/service/consolidated-view-risk-narrative.types';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';

type RiskNarrativeAiFormData = {
  customPrompt?: string;
  model?: AiModelOption;
};

type Props = {
  companyGroupId: number;
  applicationIds: string[];
  scope: ConsolidatedRiskNarrativeScope;
  isMaster?: boolean;
};

export function FormConsolidatedRiskNarrativeSection({
  companyGroupId,
  applicationIds,
  scope,
  isMaster,
}: Props) {
  const queryClient = useQueryClient();
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const [showDialog, setShowDialog] = useState(false);
  const methods = useForm<RiskNarrativeAiFormData>({
    defaultValues: { customPrompt: '' },
  });
  const { handleSubmit, reset, getValues } = methods;

  const normalizedScope = useMemo(
    () => normalizeConsolidatedRiskNarrativeScope(scope),
    [scope],
  );

  const scopeKey = buildConsolidatedRiskNarrativeScopeKey(normalizedScope, {
    companyGroupId,
    applicationIds,
  });

  const scopeQueryKey = [
    ...getConsolidatedRiskNarrativeDiagnosticQueryKey(
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
  } = useFetchConsolidatedViewRiskNarrativeDiagnostic({
    companyGroupId,
    applicationIds,
    scope: normalizedScope,
  });

  const { mutateAsync: generateDiagnostic, isPending: isGenerating } =
    useMutateGenerateConsolidatedViewRiskNarrativeDiagnostic();
  const { mutate: mutateUpsertSystemAiPrompt, isPending: isSavingDefaultPrompt } =
    useMutateUpsertSystemAiPrompt();

  const { data: systemAiPrompt, isLoading: isLoadingSystemAiPrompt } =
    useFetchSystemAiPrompt(
      SystemAiPromptKeyEnum.RISK_NARRATIVE_DIAGNOSTIC,
      isMaster && showDialog,
    );

  useEffect(() => {
    if (!isMaster || !showDialog || !systemAiPrompt) return;
    reset({
      customPrompt: systemAiPrompt.content,
      model: getValues('model'),
    });
  }, [getValues, isMaster, reset, showDialog, systemAiPrompt]);

  const status = narrativeDiagnostic?.status;
  const isDone =
    status === FormAiAnalysisStatusEnum.DONE &&
    Boolean(narrativeDiagnostic?.contentMarkdown?.trim());
  const isFailed = status === FormAiAnalysisStatusEnum.FAILED;

  const generateButtonLabel = isDone
    ? 'Regerar diagnóstico narrativo com IA'
    : 'Gerar diagnóstico narrativo com IA';

  const handleGenerateCommon = async ({
    regenerate,
    customPrompt,
    model,
  }: {
    regenerate: boolean;
    customPrompt?: string;
    model?: string;
  }): Promise<boolean> => {
    const message = regenerate
      ? 'Já existe um diagnóstico salvo para este recorte consolidado. Deseja substituir o diagnóstico atual?'
      : 'Esta ação enviará os dados consolidados de análise de riscos exibidos nesta tela para IA e poderá consumir créditos. Deseja continuar?';

    const confirmed = await showConfirmation({
      title: regenerate
        ? 'Regerar diagnóstico narrativo'
        : 'Gerar diagnóstico narrativo com IA',
      message,
      confirmText: regenerate ? 'Substituir' : 'Continuar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return false;

    const payload = {
      companyGroupId,
      applicationIds,
      scope: normalizedScope,
      regenerate,
      ...(isMaster && customPrompt?.trim()
        ? { customPrompt: customPrompt.trim() }
        : {}),
      ...(isMaster && model ? { model } : {}),
    };

    try {
      const generated = await generateDiagnostic(payload);
      queryClient.setQueryData(scopeQueryKey, generated);
      enqueueSnackbar('Diagnóstico iniciado com sucesso.', { variant: 'success' });
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
            'Já existe diagnóstico para este recorte. Sincronizando estado da tela…',
          { variant: 'warning' },
        );

        let existing = await readConsolidatedRiskNarrativeDiagnostic({
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
          return false;
        }

        enqueueSnackbar(
          messageFromApi ??
            'Não foi possível iniciar o diagnóstico narrativo consolidado.',
          { variant: 'error' },
        );
        return false;
      }

      enqueueSnackbar(
        messageFromApi ??
          'Não foi possível iniciar o diagnóstico narrativo. Tente novamente.',
        { variant: 'error' },
      );
      return false;
    }
  };

  const handleGenerate = async (regenerate: boolean) => {
    if (isMaster) {
      setShowDialog(true);
      return;
    }

    await handleGenerateCommon({ regenerate });
  };

  const handleSaveDefaultPrompt = async () => {
    const content = getValues('customPrompt')?.trim();
    if (!content) {
      enqueueSnackbar('O prompt não pode estar vazio.', { variant: 'warning' });
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Definir como prompt padrão',
      message:
        'O conteúdo atual será salvo como prompt padrão para o diagnóstico narrativo consolidado de riscos. Deseja continuar?',
      confirmText: 'Salvar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    mutateUpsertSystemAiPrompt({
      key: SystemAiPromptKeyEnum.RISK_NARRATIVE_DIAGNOSTIC,
      content,
    });
  };

  const onSubmitMaster = async (formData: RiskNarrativeAiFormData) => {
    const started = await handleGenerateCommon({
      regenerate: isDone,
      customPrompt: formData.customPrompt,
      model: formData.model?.value,
    });
    if (started) {
      setShowDialog(false);
    }
  };

  const showProcessing =
    isProcessing || status === FormAiAnalysisStatusEnum.PROCESSING;

  useEffect(() => {
    if (!isError) return;
    const message =
      typeof (error as { response?: { data?: { message?: unknown } } })?.response
        ?.data?.message === 'string'
        ? (error as { response?: { data?: { message?: string } } }).response!.data!
            .message
        : 'Falha ao carregar o diagnóstico narrativo consolidado.';

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
          <Box flex={1} minWidth={0}>
            <SText fontSize={16} fontWeight="bold">
              Diagnóstico narrativo consolidado com IA
            </SText>
            <SText fontSize={13} color="text.secondary" mt={4}>
              Síntese gerencial em texto do conjunto de análises de risco já
              existentes nas aplicações individuais consolidadas. Não cria novos
              riscos, fontes ou recomendações operacionais.
            </SText>
          </Box>
          <SButton
            variant="shade"
            color="primary"
            text={generateButtonLabel}
            loading={isGenerating}
            disabled={showProcessing || isGenerating}
            minWidth={300}
            onClick={() => void handleGenerate(isDone)}
            buttonProps={{
              sx: {
                whiteSpace: 'nowrap',
                flexShrink: 0,
                px: 2.5,
              },
            }}
          />
        </SFlex>

        {isLoading ? (
          <Skeleton variant="rectangular" height={120} />
        ) : isError ? (
          <Alert severity="error">
            Não foi possível carregar o diagnóstico narrativo consolidado.
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
            {getRiskNarrativeDiagnosticErrorMessage(
              narrativeDiagnostic?.metadata,
              isMaster,
            )}
          </Alert>
        ) : isDone && narrativeDiagnostic?.contentMarkdown ? (
          <RiskNarrativeMarkdown content={narrativeDiagnostic.contentMarkdown} />
        ) : (
          <SText fontSize={14} color="text.secondary">
            Nenhum diagnóstico gerado para este recorte consolidado. Use o botão
            acima para criar um.
          </SText>
        )}

        {isMaster && (
          <Dialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmitMaster)}>
                <DialogTitle>
                  Prompt padrão do diagnóstico narrativo consolidado de riscos
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <SSearchSelectForm
                    name="model"
                    label="Modelo de IA (opcional)"
                    options={AI_MODEL_OPTIONS}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    placeholder="Use o padrão configurado no backend"
                  />
                  {isLoadingSystemAiPrompt ? (
                    <Skeleton variant="rectangular" height={220} />
                  ) : (
                    <SInputMultilineForm
                      name="customPrompt"
                      label="Prompt padrão do diagnóstico narrativo consolidado"
                      placeholder="Prompt padrão do sistema será utilizado se vazio."
                      fullWidth
                      inputProps={{ minRows: 5, maxRows: 30 }}
                    />
                  )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
                  <SButton
                    variant="outlined"
                    color="primary"
                    text="Definir como prompt padrão"
                    loading={isSavingDefaultPrompt}
                    disabled={isLoadingSystemAiPrompt || isGenerating}
                    onClick={handleSaveDefaultPrompt}
                  />
                  <SFlex gap={2}>
                    <SButton
                      variant="outlined"
                      text="Cancelar"
                      onClick={() => setShowDialog(false)}
                    />
                    <SButton
                      variant="contained"
                      text={isDone ? 'Regerar Diagnóstico' : 'Iniciar Diagnóstico'}
                      loading={isGenerating || isLoadingSystemAiPrompt}
                      disabled={isLoadingSystemAiPrompt}
                      onClick={handleSubmit(onSubmitMaster)}
                    />
                  </SFlex>
                </DialogActions>
              </form>
            </FormProvider>
          </Dialog>
        )}
      </Box>
    </>
  );
}
