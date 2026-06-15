import { FC, useEffect, useMemo } from 'react';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import {
  getRiskFactorAiSuggestionTypeLabel,
  getRiskFactorAiSuggestionsDefaultPromptByType,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/risk-factor-ai-suggestions-type.util';
import {
  AI_MODEL_OPTIONS,
  type AiModelOption,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import { getSystemAiPromptErrorMessage } from '@v2/services/forms/system-ai-prompt/utils/system-ai-prompt-error.utils';

export type RiskFactorAiSuggestionMasterConfig = {
  customPrompt?: string;
  model?: string;
};

type RiskFactorAiSuggestionMasterConfigForm = {
  customPrompt?: string;
  model?: AiModelOption;
};

type RiskFactorAiSuggestionMasterConfigDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (config: RiskFactorAiSuggestionMasterConfig) => void;
  riskType: string;
  promptKey: SystemAiPromptKeyEnum;
};

const DEFAULT_MODEL =
  AI_MODEL_OPTIONS.find((option) => option.value === 'gpt-4o-mini') ??
  AI_MODEL_OPTIONS[0];

export const RiskFactorAiSuggestionMasterConfigDialog: FC<
  RiskFactorAiSuggestionMasterConfigDialogProps
> = ({ open, onClose, onApply, riskType, promptKey }) => {
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const factoryDefaultPrompt = useMemo(
    () => getRiskFactorAiSuggestionsDefaultPromptByType(riskType),
    [riskType],
  );
  const typeLabel = useMemo(() => getRiskFactorAiSuggestionTypeLabel(riskType), [riskType]);
  const methods = useForm<RiskFactorAiSuggestionMasterConfigForm>({
    defaultValues: {
      customPrompt: factoryDefaultPrompt,
      model: DEFAULT_MODEL,
    },
  });
  const { handleSubmit, reset, getValues, setValue } = methods;

  const {
    data: systemAiPrompt,
    isLoading: isLoadingSystemAiPrompt,
    isError: isSystemAiPromptError,
    error: systemAiPromptError,
  } = useFetchSystemAiPrompt(promptKey, open);

  const { mutate: mutateUpsertSystemAiPrompt, isPending: isSavingDefaultPrompt } =
    useMutateUpsertSystemAiPrompt();

  const factoryDefaultContent =
    systemAiPrompt?.defaultContent?.trim() || factoryDefaultPrompt;

  useEffect(() => {
    if (!open) return;

    if (systemAiPrompt) {
      reset({
        customPrompt: systemAiPrompt.content || factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
      return;
    }

    if (!isLoadingSystemAiPrompt) {
      reset({
        customPrompt: factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
    }
  }, [
    factoryDefaultContent,
    factoryDefaultPrompt,
    getValues,
    isLoadingSystemAiPrompt,
    open,
    reset,
    systemAiPrompt,
  ]);

  const handleSaveDefaultPrompt = async () => {
    const content = getValues('customPrompt')?.trim();
    if (!content) {
      enqueueSnackbar('O prompt não pode estar vazio.', { variant: 'warning' });
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Definir como prompt padrão',
      message:
        `O conteúdo atual será salvo como prompt padrão do sistema para sugestão IA de fator de risco ${typeLabel.toLowerCase()}. Deseja continuar?`,
      confirmText: 'Salvar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    mutateUpsertSystemAiPrompt({
      key: promptKey,
      content,
    });
  };

  const handleRestoreDefaultPrompt = () => {
    if (!factoryDefaultContent) {
      enqueueSnackbar(
        'Prompt padrão de fábrica não disponível para esta ferramenta.',
        { variant: 'warning' },
      );
      return;
    }

    setValue('customPrompt', factoryDefaultContent);
    enqueueSnackbar('Prompt padrão restaurado no editor.', { variant: 'info' });
  };

  const onSubmit = (formData: RiskFactorAiSuggestionMasterConfigForm) => {
    onApply({
      customPrompt: formData.customPrompt?.trim() || undefined,
      model: formData.model?.value,
    });
    enqueueSnackbar('Configuração aplicada para esta sessão.', { variant: 'success' });
    onClose();
  };

  const fetchErrorMessage = isSystemAiPromptError
    ? getSystemAiPromptErrorMessage(systemAiPromptError as any)
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Configurar Sugestão IA de Fator de Risco {typeLabel}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Configuração central para fatores de risco {typeLabel.toLowerCase()} no cadastro e,
              quando aplicável, no fluxo de métodos de HO.
            </Typography>
            {fetchErrorMessage && (
              <Alert severity="warning">{fetchErrorMessage}</Alert>
            )}
            <SSearchSelectForm
              name="model"
              label="Modelo de IA"
              placeholder="Selecione o modelo de IA"
              options={AI_MODEL_OPTIONS}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
            {isLoadingSystemAiPrompt ? (
              <Skeleton variant="rectangular" height={320} />
            ) : (
              <SInputMultilineForm
                name="customPrompt"
                label="Prompt do sistema"
                placeholder="Carregando prompt padrão do sistema..."
                fullWidth
                inputProps={{ minRows: 8, maxRows: 24 }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
            <SFlex gap={2}>
              <SButton
                variant="outlined"
                color="primary"
                text="Definir como prompt padrão"
                loading={isSavingDefaultPrompt}
                disabled={isLoadingSystemAiPrompt}
                buttonProps={{ type: 'button' }}
                onClick={handleSaveDefaultPrompt}
              />
              <Button
                type="button"
                variant="outlined"
                disabled={isLoadingSystemAiPrompt}
                onClick={handleRestoreDefaultPrompt}
              >
                Restaurar prompt padrão
              </Button>
            </SFlex>
            <SFlex gap={2}>
              <Button type="button" onClick={onClose}>
                Cancelar
              </Button>
              <SButton
                variant="contained"
                text="Aplicar configuração"
                disabled={isLoadingSystemAiPrompt}
                buttonProps={{ type: 'button' }}
                onClick={handleSubmit(onSubmit)}
              />
            </SFlex>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
