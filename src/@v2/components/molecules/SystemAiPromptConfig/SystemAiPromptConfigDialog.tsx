import React, { FC, useEffect, useMemo } from 'react';

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
  AI_MODEL_OPTIONS,
  type AiModelOption,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import { getSystemAiPromptErrorMessage } from '@v2/services/forms/system-ai-prompt/utils/system-ai-prompt-error.utils';

import type { SystemAiMasterConfig } from '../AiActionButtonGroup/system-ai-master-config.types';

type SystemAiPromptConfigForm = {
  customPrompt?: string;
  model?: AiModelOption;
};

export type SystemAiPromptConfigDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (config: SystemAiMasterConfig) => void;
  title: string;
  description?: string;
  promptKey?: SystemAiPromptKeyEnum;
  factoryDefaultPrompt?: string;
  /**
   * Session-applied MASTER overrides (from a previous "Aplicar configuração").
   * When present, takes precedence over persisted SystemAiPrompt / factory on open.
   */
  initialConfig?: SystemAiMasterConfig;
  promptLabel?: string;
  modelLabel?: string;
  modelPlaceholder?: string;
  showSaveDefault?: boolean;
  saveDefaultConfirmMessage?: string;
  showRestoreDefault?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  promptMinRows?: number;
  promptMaxRows?: number;
};

const DEFAULT_MODEL =
  AI_MODEL_OPTIONS.find((option) => option.value === 'gpt-4o-mini') ??
  AI_MODEL_OPTIONS[0];

export const SystemAiPromptConfigDialog: FC<SystemAiPromptConfigDialogProps> = ({
  open,
  onClose,
  onApply,
  title,
  description,
  promptKey,
  factoryDefaultPrompt = '',
  initialConfig,
  promptLabel = 'Prompt do sistema',
  modelLabel = 'Modelo de IA',
  modelPlaceholder = 'Selecione o modelo de IA',
  showSaveDefault = Boolean(promptKey),
  saveDefaultConfirmMessage,
  showRestoreDefault = Boolean(promptKey),
  maxWidth = 'md',
  promptMinRows = 8,
  promptMaxRows = 24,
}) => {
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const methods = useForm<SystemAiPromptConfigForm>({
    defaultValues: {
      customPrompt: factoryDefaultPrompt,
      model: DEFAULT_MODEL,
    },
  });
  const { handleSubmit, reset, getValues, setValue } = methods;

  const fetchEnabled = open && Boolean(promptKey);
  const {
    data: systemAiPrompt,
    isLoading: isLoadingSystemAiPrompt,
    isError: isSystemAiPromptError,
    error: systemAiPromptError,
  } = useFetchSystemAiPrompt(
    promptKey ?? SystemAiPromptKeyEnum.RISK_SOURCES_RECOMMENDATIONS,
    fetchEnabled,
  );

  const { mutate: mutateUpsertSystemAiPrompt, isPending: isSavingDefaultPrompt } =
    useMutateUpsertSystemAiPrompt();

  const factoryDefaultContent = useMemo(() => {
    if (promptKey) {
      return systemAiPrompt?.defaultContent?.trim() || factoryDefaultPrompt;
    }

    return factoryDefaultPrompt;
  }, [factoryDefaultPrompt, promptKey, systemAiPrompt?.defaultContent]);

  const resolveModelOption = (modelValue?: string): AiModelOption => {
    if (!modelValue) return getValues('model') ?? DEFAULT_MODEL;
    return (
      AI_MODEL_OPTIONS.find((option) => option.value === modelValue) ??
      getValues('model') ??
      DEFAULT_MODEL
    );
  };

  useEffect(() => {
    if (!open) return;

    const sessionPrompt = initialConfig?.customPrompt?.trim();
    const sessionModel = resolveModelOption(initialConfig?.model);

    // Session-applied config wins over persisted SystemAiPrompt / factory.
    if (sessionPrompt || initialConfig?.model) {
      reset({
        customPrompt:
          sessionPrompt ||
          systemAiPrompt?.content ||
          factoryDefaultContent ||
          getValues('customPrompt') ||
          '',
        model: sessionModel,
      });
      return;
    }

    if (promptKey && systemAiPrompt) {
      reset({
        customPrompt: systemAiPrompt.content || factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
      return;
    }

    if (!promptKey && !isLoadingSystemAiPrompt) {
      reset({
        customPrompt: getValues('customPrompt') ?? factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
      return;
    }

    if (promptKey && !isLoadingSystemAiPrompt) {
      reset({
        customPrompt: factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getValues/resolveModelOption are stable enough; avoid reset loops
  }, [
    factoryDefaultContent,
    initialConfig?.customPrompt,
    initialConfig?.model,
    isLoadingSystemAiPrompt,
    open,
    promptKey,
    reset,
    systemAiPrompt,
  ]);

  const handleSaveDefaultPrompt = async () => {
    if (!promptKey) return;

    const content = getValues('customPrompt')?.trim();
    if (!content) {
      enqueueSnackbar('O prompt não pode estar vazio.', { variant: 'warning' });
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Definir como prompt padrão',
      message:
        saveDefaultConfirmMessage ??
        'O conteúdo atual será salvo como prompt padrão do sistema. Deseja continuar?',
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
      enqueueSnackbar('Prompt padrão de fábrica não disponível.', {
        variant: 'warning',
      });
      return;
    }

    setValue('customPrompt', factoryDefaultContent);
    enqueueSnackbar('Prompt padrão restaurado no editor.', { variant: 'info' });
  };

  const onSubmit = (formData: SystemAiPromptConfigForm) => {
    onApply({
      customPrompt: formData.customPrompt?.trim() || undefined,
      model: formData.model?.value,
    });
    enqueueSnackbar('Configuração aplicada para esta sessão.', { variant: 'success' });
    onClose();
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // MUI Dialog portals to document.body, but React still bubbles submit through the
    // React tree. This dialog is often rendered under another <form> (e.g. Caracterização
    // SModalPaper). Without stopPropagation, "Aplicar configuração" submits the parent
    // form and can close the whole characterization modal (saveRef default = false → onClose).
    event.preventDefault();
    event.stopPropagation();
    void handleSubmit(onSubmit)(event);
  };

  const fetchErrorMessage =
    promptKey && isSystemAiPromptError
      ? getSystemAiPromptErrorMessage(systemAiPromptError as Error)
      : null;

  const hasSessionAppliedConfig = Boolean(
    initialConfig?.customPrompt?.trim() || initialConfig?.model,
  );

  // Session override can be shown immediately; still fetch for restore/save-default baseline.
  const isLoadingPrompt =
    Boolean(promptKey) && isLoadingSystemAiPrompt && !hasSessionAppliedConfig;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <FormProvider {...methods}>
        <form onSubmit={handleFormSubmit}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
            {fetchErrorMessage && <Alert severity="warning">{fetchErrorMessage}</Alert>}
            <SSearchSelectForm
              name="model"
              label={modelLabel}
              placeholder={modelPlaceholder}
              options={AI_MODEL_OPTIONS}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
            {isLoadingPrompt ? (
              <Skeleton variant="rectangular" height={320} />
            ) : (
              <SInputMultilineForm
                name="customPrompt"
                label={promptLabel}
                placeholder={
                  promptKey
                    ? 'Carregando prompt padrão do sistema...'
                    : 'Digite instruções específicas para a análise de IA...'
                }
                fullWidth
                inputProps={{ minRows: promptMinRows, maxRows: promptMaxRows }}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
            {showSaveDefault || showRestoreDefault ? (
              <SFlex gap={2}>
                {showSaveDefault && (
                  <SButton
                    variant="outlined"
                    color="primary"
                    text="Definir como prompt padrão"
                    loading={isSavingDefaultPrompt}
                    disabled={isLoadingPrompt}
                    buttonProps={{ type: 'button' }}
                    onClick={() => void handleSaveDefaultPrompt()}
                  />
                )}
                {showRestoreDefault && (
                  <Button
                    type="button"
                    variant="outlined"
                    disabled={isLoadingPrompt}
                    onClick={handleRestoreDefaultPrompt}
                  >
                    Restaurar prompt padrão
                  </Button>
                )}
              </SFlex>
            ) : (
              <span />
            )}
            <SFlex gap={2}>
              <Button type="button" onClick={onClose}>
                Cancelar
              </Button>
              <SButton
                variant="contained"
                text="Aplicar configuração"
                disabled={isLoadingPrompt}
                // type="button" avoids native nested-form submit; handleFormSubmit also
                // stopPropagation for Enter/keyboard submit on the local form.
                buttonProps={{ type: 'button' }}
                onClick={() => void handleSubmit(onSubmit)()}
              />
            </SFlex>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};
