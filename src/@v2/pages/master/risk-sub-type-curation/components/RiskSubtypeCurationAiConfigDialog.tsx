import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Skeleton,
  Switch,
  Typography,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import {
  AI_MODEL_OPTIONS,
  type AiModelOption,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import {
  useFetchRiskSubTypeAiInstruction,
  useMutatePreviewRiskSubtypeCurationAiPrompt,
  useMutateUpsertRiskSubTypeAiInstruction,
} from '@v2/services/security/risk/sub-type/risk-subtype-curation/hooks/useRiskSubtypeCurationAi';
import type { IRiskSubtypeCurationAiPromptPreview } from '@v2/services/security/risk/sub-type/risk-subtype-curation/risk-subtype-curation.types';

type RiskSubtypeCurationAiConfigForm = {
  model?: AiModelOption;
  sessionCustomPrompt?: string;
  useSystemDefault: boolean;
  instructions?: string;
  positiveExamples?: string;
  negativeExamples?: string;
  cautionRules?: string;
};

type RiskSubtypeCurationAiConfigDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (config: SystemAiMasterConfig) => void;
  subTypeId: number;
  subTypeName: string;
};

const DEFAULT_MODEL =
  AI_MODEL_OPTIONS.find((option) => option.value === 'gpt-4o-mini') ??
  AI_MODEL_OPTIONS[0];

function resolveModelOption(value?: string | null): AiModelOption {
  if (!value) return DEFAULT_MODEL;
  return AI_MODEL_OPTIONS.find((option) => option.value === value) ?? DEFAULT_MODEL;
}

export const RiskSubtypeCurationAiConfigDialog: FC<
  RiskSubtypeCurationAiConfigDialogProps
> = ({ open, onClose, onApply, subTypeId, subTypeName }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<IRiskSubtypeCurationAiPromptPreview | null>(
    null,
  );

  const methods = useForm<RiskSubtypeCurationAiConfigForm>({
    defaultValues: {
      model: DEFAULT_MODEL,
      sessionCustomPrompt: '',
      useSystemDefault: true,
      instructions: '',
      positiveExamples: '',
      negativeExamples: '',
      cautionRules: '',
    },
  });
  const { handleSubmit, reset, getValues, setValue, watch } = methods;
  const useSystemDefault = watch('useSystemDefault');

  const {
    data: instruction,
    isLoading: isLoadingInstruction,
    isError: isInstructionError,
  } = useFetchRiskSubTypeAiInstruction(subTypeId, open);

  const { data: systemAiPrompt, isLoading: isLoadingSystemPrompt } = useFetchSystemAiPrompt(
    SystemAiPromptKeyEnum.RISK_SUBTYPE_CURATION_SUGGESTIONS,
    open,
  );

  const { mutate: saveInstruction, isPending: isSavingInstruction } =
    useMutateUpsertRiskSubTypeAiInstruction();
  const { mutate: previewPrompt, isPending: isPreviewing } =
    useMutatePreviewRiskSubtypeCurationAiPrompt();
  const { mutate: saveGlobalPrompt, isPending: isSavingGlobalPrompt } =
    useMutateUpsertSystemAiPrompt();

  const factoryDefaultContent = useMemo(
    () => systemAiPrompt?.defaultContent?.trim() ?? '',
    [systemAiPrompt?.defaultContent],
  );

  useEffect(() => {
    if (!open || !instruction) return;

    reset({
      model: resolveModelOption(instruction.preferredModel),
      sessionCustomPrompt: getValues('sessionCustomPrompt') ?? '',
      useSystemDefault: instruction.useSystemDefault,
      instructions: instruction.instructions ?? '',
      positiveExamples: instruction.positiveExamples ?? '',
      negativeExamples: instruction.negativeExamples ?? '',
      cautionRules: instruction.cautionRules ?? '',
    });
  }, [getValues, instruction, open, reset]);

  const buildDraftPayload = () => {
    const formData = getValues();
    return {
      subTypeId,
      useSystemDefault: formData.useSystemDefault,
      instructions: formData.instructions?.trim() || null,
      positiveExamples: formData.positiveExamples?.trim() || null,
      negativeExamples: formData.negativeExamples?.trim() || null,
      cautionRules: formData.cautionRules?.trim() || null,
      preferredModel: formData.model?.value ?? null,
      customPrompt: formData.sessionCustomPrompt?.trim() || undefined,
      model: formData.model?.value,
    };
  };

  const handleUpdatePreview = () => {
    previewPrompt(buildDraftPayload(), {
      onSuccess: (data: IRiskSubtypeCurationAiPromptPreview) => {
        setPreviewData(data);
        setPreviewOpen(true);
      },
      onError: () => {
        enqueueSnackbar('Não foi possível gerar o preview do prompt.', { variant: 'error' });
      },
    });
  };

  const handleSaveForSubType = () => {
    const formData = getValues();
    saveInstruction(
      {
        subTypeId,
        useSystemDefault: formData.useSystemDefault,
        instructions: formData.instructions?.trim() || null,
        positiveExamples: formData.positiveExamples?.trim() || null,
        negativeExamples: formData.negativeExamples?.trim() || null,
        cautionRules: formData.cautionRules?.trim() || null,
        preferredModel: formData.model?.value ?? null,
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Configuração salva para este subtipo.', { variant: 'success' });
        },
        onError: () => {
          enqueueSnackbar('Não foi possível salvar a configuração do subtipo.', {
            variant: 'error',
          });
        },
      },
    );
  };

  const handleRestoreDefault = () => {
    setValue('useSystemDefault', true);
    setValue('instructions', '');
    setValue('positiveExamples', '');
    setValue('negativeExamples', '');
    setValue('cautionRules', '');
    setValue('sessionCustomPrompt', '');
    if (factoryDefaultContent) {
      enqueueSnackbar('Valores do subtipo restaurados para o padrão do sistema.', {
        variant: 'info',
      });
    }
  };

  const handleSaveGlobalDefault = () => {
    const content = getValues('instructions')?.trim() || factoryDefaultContent;
    if (!content) {
      enqueueSnackbar('Não há conteúdo para salvar como prompt global.', { variant: 'warning' });
      return;
    }

    saveGlobalPrompt(
      {
        key: SystemAiPromptKeyEnum.RISK_SUBTYPE_CURATION_SUGGESTIONS,
        content,
      },
      {
        onSuccess: () => {
          enqueueSnackbar('Prompt global padrão atualizado.', { variant: 'success' });
        },
        onError: () => {
          enqueueSnackbar('Não foi possível salvar o prompt global.', { variant: 'error' });
        },
      },
    );
  };

  const onSubmit = (formData: RiskSubtypeCurationAiConfigForm) => {
    onApply({
      customPrompt: formData.sessionCustomPrompt?.trim() || undefined,
      model: formData.model?.value,
    });
    enqueueSnackbar('Configuração aplicada para esta sessão.', { variant: 'success' });
    onClose();
  };

  const isLoading = isLoadingInstruction || isLoadingSystemPrompt;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Configurar IA da curadoria de subtipos</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Subtipo alvo: <strong>{subTypeName}</strong>. A IA apenas sugere candidatos; a
              aplicação em massa continua manual.
            </Typography>

            {isInstructionError && (
              <Alert severity="warning">
                Não foi possível carregar a configuração persistida deste subtipo.
              </Alert>
            )}

            {instruction?.updatedAt && (
              <Typography variant="caption" color="text.secondary">
                Última alteração: {new Date(instruction.updatedAt).toLocaleString('pt-BR')}
                {instruction.revision ? ` (revisão ${instruction.revision})` : ''}
              </Typography>
            )}

            {isLoading ? (
              <Skeleton variant="rectangular" height={320} />
            ) : (
              <>
                <SSearchSelectForm
                  name="model"
                  label="Modelo de IA"
                  placeholder="Selecione o modelo de IA"
                  options={AI_MODEL_OPTIONS}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={!useSystemDefault}
                      onChange={(event) =>
                        setValue('useSystemDefault', !event.target.checked)
                      }
                    />
                  }
                  label="Usar instruções customizadas deste subtipo"
                />

                {!useSystemDefault && (
                  <>
                    <SInputMultilineForm
                      name="instructions"
                      label="Instruções do subtipo"
                      placeholder="Critérios de inclusão/exclusão específicos deste subtipo..."
                      fullWidth
                      inputProps={{ minRows: 4, maxRows: 12 }}
                    />
                    <SInputMultilineForm
                      name="positiveExamples"
                      label="Exemplos positivos"
                      placeholder="Um por linha ou texto livre..."
                      fullWidth
                      inputProps={{ minRows: 3, maxRows: 8 }}
                    />
                    <SInputMultilineForm
                      name="negativeExamples"
                      label="Exemplos negativos"
                      placeholder="Um por linha ou texto livre..."
                      fullWidth
                      inputProps={{ minRows: 3, maxRows: 8 }}
                    />
                    <SInputMultilineForm
                      name="cautionRules"
                      label="Regras de cautela/ambiguidade"
                      placeholder="Orientações para casos ambíguos..."
                      fullWidth
                      inputProps={{ minRows: 3, maxRows: 8 }}
                    />
                  </>
                )}

                <SInputMultilineForm
                  name="sessionCustomPrompt"
                  label="Instrução adicional da sessão (não persiste)"
                  placeholder="Ajuste pontual apenas para a próxima execução..."
                  fullWidth
                  inputProps={{ minRows: 3, maxRows: 8 }}
                />

                <Box>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleUpdatePreview}
                    disabled={isPreviewing}
                  >
                    {isPreviewing ? 'Atualizando preview…' : 'Atualizar preview'}
                  </Button>
                </Box>

                <Collapse in={previewOpen}>
                  {previewData && (
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Prompt final ({previewData.selectedModel})
                      </Typography>
                      {previewData.sections.map((section) => (
                        <Typography
                          key={`${section.name}-${section.source}`}
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {section.name} — fonte: {section.source}
                        </Typography>
                      ))}
                      <Box
                        component="pre"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: 12,
                          mt: 1,
                          maxHeight: 280,
                          overflow: 'auto',
                        }}
                      >
                        {previewData.assembledPrompt}
                      </Box>
                    </Box>
                  )}
                </Collapse>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
            <SFlex gap={2} flexWrap="wrap">
              <SButton
                variant="outlined"
                color="primary"
                text="Salvar para este subtipo"
                loading={isSavingInstruction}
                disabled={isLoading}
                buttonProps={{ type: 'button' }}
                onClick={handleSaveForSubType}
              />
              <Button type="button" variant="outlined" disabled={isLoading} onClick={handleRestoreDefault}>
                Restaurar padrão
              </Button>
              <SButton
                variant="outlined"
                color="info"
                text="Definir prompt global"
                loading={isSavingGlobalPrompt}
                disabled={isLoading}
                buttonProps={{ type: 'button' }}
                onClick={handleSaveGlobalDefault}
              />
            </SFlex>
            <SFlex gap={2}>
              <Button type="button" onClick={onClose}>
                Cancelar
              </Button>
              <SButton
                variant="contained"
                text="Aplicar configuração"
                disabled={isLoading}
                buttonProps={{ type: 'submit' }}
              />
            </SFlex>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
