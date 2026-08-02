import { useCallback, useEffect, useMemo, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { useQueryCharacterization } from 'core/services/hooks/queries/useQueryCharacterization';

import { invalidateCharacterizationInventory } from './invalidate-characterization-inventory';
import {
  emptyEnvironmentalParameterValues,
  ENVIRONMENTAL_PARAMETERS,
  type EnvironmentalParameterKey,
} from './environmental-parameters.util';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  row: CharacterizationBrowseResultModel | null;
};

type Draft = Record<EnvironmentalParameterKey, string>;

/**
 * Modal compacto — edita parâmetros ambientais sem abrir o editor completo.
 * Campos vêm do catálogo ENVIRONMENTAL_PARAMETERS (extensível).
 */
export function CharacterizationEnvironmentalParamsDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  row,
}: Props) {
  const characterizationId = row?.id || '';
  const upsertMutation = useMutUpsertCharacterization();
  const [draft, setDraft] = useState<Draft>(emptyEnvironmentalParameterValues());
  const [saving, setSaving] = useState(false);

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useQueryCharacterization(open ? characterizationId : '', {
    companyId,
    workspaceId,
  });

  useEffect(() => {
    if (!open) {
      setDraft(emptyEnvironmentalParameterValues());
      return;
    }
    if (!detail?.id) return;
    setDraft({
      temperature: String(detail.temperature || ''),
      moisturePercentage: String(detail.moisturePercentage || ''),
      noiseValue: String(detail.noiseValue || ''),
      luminosity: String(detail.luminosity || ''),
    });
  }, [open, detail]);

  const dirty = useMemo(() => {
    if (!detail?.id) return false;
    return ENVIRONMENTAL_PARAMETERS.some((param) => {
      const current = String(detail[param.key] || '').trim();
      const next = String(draft[param.key] || '').trim();
      return current !== next;
    });
  }, [detail, draft]);

  const handleClose = useCallback(async () => {
    await invalidateCharacterizationInventory({
      companyId,
      workspaceId,
      characterizationId,
    });
    onClose();
  }, [companyId, workspaceId, characterizationId, onClose]);

  const handleSave = useCallback(async () => {
    if (!detail?.id || !dirty) return;
    setSaving(true);
    try {
      await upsertMutation.mutateAsync({
        id: detail.id,
        name: detail.name,
        type: detail.type,
        companyId,
        workspaceId,
        temperature: draft.temperature.trim(),
        moisturePercentage: draft.moisturePercentage.trim(),
        noiseValue: draft.noiseValue.trim(),
        luminosity: draft.luminosity.trim(),
      });
      await invalidateCharacterizationInventory({
        companyId,
        workspaceId,
        characterizationId: detail.id,
      });
      onClose();
    } catch {
      // snackbar já tratado pela mutation
    } finally {
      setSaving(false);
    }
  }, [
    detail,
    dirty,
    draft,
    companyId,
    workspaceId,
    upsertMutation,
    onClose,
  ]);

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : () => void handleClose()}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { maxWidth: 420 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          pr: 1,
          py: 1.5,
        }}
      >
        <Box>
          <Typography component="span" fontWeight={700} fontSize={17}>
            Parâmetros Ambientais
          </Typography>
          {row?.name ? (
            <Typography variant="body2" color="text.secondary">
              {row.name}
            </Typography>
          ) : null}
        </Box>
        <IconButton
          aria-label="Fechar"
          onClick={() => void handleClose()}
          disabled={saving}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 2 }}>
        {isLoading && !detail ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        ) : null}
        {isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            }
          >
            Não foi possível carregar os parâmetros.
          </Alert>
        ) : null}
        {detail ? (
          <Box display="flex" flexDirection="column" gap={1.75}>
            {ENVIRONMENTAL_PARAMETERS.map((param) => (
              <TextField
                key={param.key}
                size="small"
                fullWidth
                label={param.label}
                value={draft[param.key]}
                disabled={saving}
                placeholder={param.placeholder}
                onChange={(e) => {
                  const value = e.target.value;
                  setDraft((prev) => ({ ...prev, [param.key]: value }));
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">{param.unit}</InputAdornment>
                  ),
                }}
              />
            ))}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={() => void handleClose()} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving || !dirty || !detail}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
