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
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetchRiskNarrativeDiagnostic } from '@v2/services/forms/risk-narrative-diagnostic/hooks/useFetchRiskNarrativeDiagnostic';
import { useMutateGenerateRiskNarrativeDiagnostic } from '@v2/services/forms/risk-narrative-diagnostic/hooks/useMutateGenerateRiskNarrativeDiagnostic';
import type { RiskNarrativeDiagnosticScope } from '@v2/services/forms/risk-narrative-diagnostic/service/risk-narrative-diagnostic.types';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { getRiskNarrativeDiagnosticErrorMessage } from './risk-narrative-diagnostic.utils';
import { RiskNarrativeMarkdown } from './RiskNarrativeMarkdown';
import { AI_MODEL_OPTIONS, AiModelOption } from './ai-model-options';

type RiskNarrativeAiFormData = {
  customPrompt?: string;
  model?: AiModelOption;
};

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
  const { enqueueSnackbar } = useSnackbar();
  const [showDialog, setShowDialog] = useState(false);
  const methods = useForm<RiskNarrativeAiFormData>({
    defaultValues: {
      customPrompt: '',
    },
  });
  const { handleSubmit, reset, getValues } = methods;

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

  const status = riskNarrativeDiagnostic?.status;
  const isDone =
    status === FormAiAnalysisStatusEnum.DONE &&
    Boolean(riskNarrativeDiagnostic?.contentMarkdown?.trim());
  const isFailed = status === FormAiAnalysisStatusEnum.FAILED;

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
        ...(isMaster && customPrompt?.trim()
          ? { customPrompt: customPrompt.trim() }
          : {}),
        ...(isMaster && model ? { model } : {}),
      },
      {
        onSuccess: () => {
          void refetch();
        },
      },
    );
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
        'O conteúdo atual será salvo como prompt padrão para o diagnóstico narrativo com IA. Deseja continuar?',
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
    await handleGenerateCommon({
      regenerate: isDone,
      customPrompt: formData.customPrompt,
      model: formData.model?.value,
    });
    setShowDialog(false);
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
        <SButton
          variant="shade"
          color="primary"
          text={
            isDone ? 'Regerar diagnóstico com IA' : 'Gerar diagnóstico com IA'
          }
          loading={isGenerating}
          disabled={showProcessing || isGenerating}
          onClick={() => void handleGenerate(isDone)}
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
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmitMaster)}>
              <DialogTitle>Configurar Diagnóstico Narrativo de IA</DialogTitle>
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
                    label="Prompt do diagnóstico"
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
  );
};
