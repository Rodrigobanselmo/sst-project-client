import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import { getSystemAiPromptErrorMessage } from '@v2/services/forms/system-ai-prompt/utils/system-ai-prompt-error.utils';

import {
  CATALOG_ONLY_PROTECTED_RULES_SUMMARY,
  resolveCatalogOnlyContextFields,
  resolveCatalogOnlyIdentificationGuidanceFactoryDefault,
  resolveCatalogOnlyIdentificationGuidancePromptKey,
} from './catalog-only-identification-guidance.constants';
import type { SuggestCatalogRisksContextKind } from './resolve-suggest-catalog-risks-context.util';

type Props = {
  open: boolean;
  onClose: () => void;
  kind: SuggestCatalogRisksContextKind;
};

function formatUpdatedAt(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) {
    return 'ainda não persistido';
  }
  return date.toLocaleString('pt-BR');
}

export const SuggestCatalogRisksMasterConfigDialog: FC<Props> = ({
  open,
  onClose,
  kind,
}) => {
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const promptKey = resolveCatalogOnlyIdentificationGuidancePromptKey(kind);
  const factoryDefault =
    resolveCatalogOnlyIdentificationGuidanceFactoryDefault(kind);
  const contextFields = resolveCatalogOnlyContextFields(kind);
  const titleKind = kind === 'gse' ? 'GSE' : 'Elemento caracterizável';

  const [draft, setDraft] = useState(factoryDefault);

  const {
    data: systemAiPrompt,
    isLoading,
    isError,
    error,
  } = useFetchSystemAiPrompt(promptKey, open);

  const { mutate: mutateUpsert, isPending: isSaving } =
    useMutateUpsertSystemAiPrompt();

  const activeContent = useMemo(() => {
    return systemAiPrompt?.content?.trim() || factoryDefault;
  }, [factoryDefault, systemAiPrompt?.content]);

  const factoryContent = useMemo(() => {
    return systemAiPrompt?.defaultContent?.trim() || factoryDefault;
  }, [factoryDefault, systemAiPrompt?.defaultContent]);

  const hasOfficialDefault = Boolean(
    systemAiPrompt?.hasOfficialDefault ||
      systemAiPrompt?.officialDefaultContent?.trim(),
  );

  const isDirty =
    draft.trim() !== (systemAiPrompt?.content?.trim() || factoryDefault.trim());

  useEffect(() => {
    if (!open) return;
    if (isLoading) return;
    setDraft(activeContent);
  }, [activeContent, isLoading, open]);

  const fetchErrorMessage = isError
    ? getSystemAiPromptErrorMessage(error as Error)
    : null;

  const handleSave = async () => {
    const content = draft.trim();
    if (!content) {
      enqueueSnackbar('A orientação funcional não pode estar vazia.', {
        variant: 'warning',
      });
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Salvar orientação em uso',
      message: `O texto do editor será persistido como versão em uso (${titleKind}) e passará a ser utilizado imediatamente nas análises catalog-only. O padrão oficial não será alterado. Deseja continuar?`,
      confirmText: 'Salvar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });
    if (!confirmed) return;

    mutateUpsert({ key: promptKey, content, action: 'save' });
  };

  const handleDefineAsDefault = async () => {
    if (isDirty) {
      enqueueSnackbar(
        'Há alterações não salvas. Salve a versão em uso antes de definir como padrão.',
        { variant: 'warning' },
      );
      return;
    }

    if (!systemAiPrompt?.isPersistedDefault) {
      enqueueSnackbar(
        'Salve a orientação em uso antes de defini-la como padrão oficial.',
        { variant: 'warning' },
      );
      return;
    }

    const confirmed = await showConfirmation({
      title: 'Definir como padrão',
      message: `A versão em uso atualmente salva será promovida a padrão oficial configurável (${titleKind}). O conteúdo em uso não muda. Deseja continuar?`,
      confirmText: 'Definir como padrão',
      cancelText: 'Cancelar',
      variant: 'warning',
    });
    if (!confirmed) return;

    mutateUpsert({ key: promptKey, action: 'promote' });
  };

  const handleRestore = async () => {
    const sourceLabel = hasOfficialDefault
      ? 'o último padrão oficial definido pelo master'
      : 'o padrão de fábrica do código (ainda não há padrão oficial)';

    const confirmed = await showConfirmation({
      title: 'Restaurar padrão',
      message: `A versão em uso (${titleKind}) será substituída por ${sourceLabel}. O padrão oficial configurável não será alterado. Deseja continuar?`,
      confirmText: 'Restaurar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });
    if (!confirmed) return;

    mutateUpsert(
      { key: promptKey, action: 'restore' },
      {
        onSuccess: (data) => {
          setDraft(data.content || factoryContent);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Configurar orientação funcional — {titleKind}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Somente o master do sistema pode editar as orientações funcionais de
          identificação de fatores (modo catalog-only). Salvar atualiza a
          versão em uso; Definir como padrão promove essa versão a padrão
          oficial; Restaurar recupera o oficial (ou a fábrica). As regras
          protegidas permanecem em código.
        </Typography>

        {fetchErrorMessage && (
          <Alert severity="warning">{fetchErrorMessage}</Alert>
        )}

        <Alert severity="info">
          Revisão ativa: {systemAiPrompt?.revision ?? 0}
          {' · '}
          Última atualização: {formatUpdatedAt(systemAiPrompt?.updatedAt)}
          {systemAiPrompt?.isPersistedDefault
            ? ' · versão em uso persistida'
            : ' · usando padrão de código'}
          {hasOfficialDefault
            ? ' · padrão oficial definido'
            : ' · sem padrão oficial (fábrica disponível)'}
        </Alert>

        {isLoading ? (
          <Skeleton variant="rectangular" height={220} />
        ) : (
          <TextField
            label="Orientação funcional editável (identificação de fatores)"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            multiline
            minRows={10}
            maxRows={28}
            fullWidth
            helperText="Este texto complementa o prompt. Não substitui as regras protegidas abaixo."
          />
        )}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Regras protegidas do sistema (somente leitura)
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2.5,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'action.hover',
            }}
          >
            {CATALOG_ONLY_PROTECTED_RULES_SUMMARY.map((rule) => (
              <Typography
                key={rule}
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {rule}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Campos de contexto enviados à IA ({titleKind})
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2.5,
              py: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {contextFields.map((field) => (
              <Typography
                key={field}
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.25 }}
              >
                {field}
              </Typography>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, flexWrap: 'wrap', gap: 1 }}>
        <SFlex gap={2} sx={{ flexWrap: 'wrap' }}>
          <SButton
            variant="outlined"
            color="primary"
            text="Salvar"
            loading={isSaving}
            disabled={isLoading}
            buttonProps={{ type: 'button' }}
            onClick={() => void handleSave()}
          />
          <Button
            type="button"
            variant="outlined"
            disabled={isLoading || isSaving}
            onClick={() => void handleDefineAsDefault()}
          >
            Definir como padrão
          </Button>
          <Button
            type="button"
            variant="outlined"
            disabled={isLoading || isSaving}
            onClick={() => void handleRestore()}
          >
            Restaurar padrão
          </Button>
        </SFlex>
        <Button type="button" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
