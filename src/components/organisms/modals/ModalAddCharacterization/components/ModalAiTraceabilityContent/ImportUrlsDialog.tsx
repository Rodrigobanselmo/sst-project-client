import React, { useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { importTechnicalRecordUrlSuggestions } from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.service';
import type {
  CharacterizationTechnicalRecordSourceInput,
  TechnicalUrlImportSuggestion,
} from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.types';

import {
  SOURCE_STRENGTH_LABELS,
  SOURCE_TYPE_LABELS,
} from './technical-traceability.labels';

const STATUS_LABELS: Record<TechnicalUrlImportSuggestion['status'], string> = {
  READ_SUCCESS: 'Lida com sucesso',
  PARTIAL: 'Leitura parcial',
  METADATA_ONLY: 'Metadados identificados',
  READ_FAILED: 'Falha na leitura',
  BLOCKED: 'URL bloqueada',
  ALREADY_REGISTERED: 'Fonte já cadastrada',
  INVALID_URL: 'URL inválida',
};

type ImportUrlsDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  existingUrls: string[];
  onConfirm: (sources: CharacterizationTechnicalRecordSourceInput[]) => void;
};

export const ImportUrlsDialog: React.FC<ImportUrlsDialogProps> = ({
  open,
  onClose,
  companyId,
  workspaceId,
  characterizationId,
  existingUrls,
  onConfirm,
}) => {
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<TechnicalUrlImportSuggestion[]>(
    [],
  );
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectable = useMemo(
    () =>
      suggestions.filter(
        (item) =>
          item.normalizedUrl &&
          item.status !== 'INVALID_URL' &&
          item.status !== 'BLOCKED',
      ),
    [suggestions],
  );

  const handleProcess = async () => {
    setError(null);
    const urls = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!urls.length) {
      setError('Cole ao menos uma URL (uma por linha).');
      return;
    }

    setLoading(true);
    try {
      const result = await importTechnicalRecordUrlSuggestions({
        companyId,
        workspaceId,
        characterizationId,
        urls,
        excludeUrls: existingUrls,
      });
      setSuggestions(result);
      const nextSelected: Record<string, boolean> = {};
      result.forEach((item, index) => {
        const key = item.normalizedUrl || `${item.originalUrl}-${index}`;
        nextSelected[key] =
          Boolean(item.normalizedUrl) &&
          item.status !== 'INVALID_URL' &&
          item.status !== 'BLOCKED' &&
          item.status !== 'ALREADY_REGISTERED' &&
          item.status !== 'READ_FAILED';
      });
      setSelected(nextSelected);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível processar as URLs.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const sources: CharacterizationTechnicalRecordSourceInput[] = [];
    suggestions.forEach((item, index) => {
      const key = item.normalizedUrl || `${item.originalUrl}-${index}`;
      if (!selected[key] || !item.normalizedUrl) return;
      if (item.status === 'BLOCKED' || item.status === 'INVALID_URL') return;

      sources.push({
        sourceType: item.suggestedSourceType,
        sourceStrength: item.suggestedStrength,
        title: item.title,
        authorInstitution: item.authorInstitution,
        publicationOrRevisionDate: item.publicationDate,
        fileName: item.fileName,
        url: item.normalizedUrl,
        accessedAt: item.accessedAt.slice(0, 10),
        applicationInCharacterization: '',
      });
    });

    onConfirm(sources);
    setRawText('');
    setSuggestions([]);
    setSelected({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Importar fontes por URL</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Cole uma URL por linha. Nada é salvo automaticamente — revise as
          sugestões antes de adicionar ao registro.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="URLs"
          fullWidth
          multiline
          minRows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={'https://exemplo.com/documento\nhttps://exemplo.com/ficha.pdf'}
          helperText="Linhas vazias são ignoradas. Duplicatas na lista são removidas."
        />

        <SFlex justify="flex-end" sx={{ mt: 2, mb: 2 }}>
          <SButton
            variant="contained"
            text="Processar URLs"
            onClick={handleProcess}
            loading={loading}
          />
        </SFlex>

        {!!suggestions.length && (
          <Box>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Sugestões ({selectable.length} selecionáveis)
            </SText>
            {suggestions.map((item, index) => {
              const key = item.normalizedUrl || `${item.originalUrl}-${index}`;
              const canSelect =
                Boolean(item.normalizedUrl) &&
                item.status !== 'INVALID_URL' &&
                item.status !== 'BLOCKED';

              return (
                <Box
                  key={key}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(selected[key])}
                        disabled={!canSelect}
                        onChange={(_, checked) =>
                          setSelected((prev) => ({ ...prev, [key]: checked }))
                        }
                      />
                    }
                    label={
                      <SText variant="body2" sx={{ fontWeight: 600 }}>
                        {STATUS_LABELS[item.status]} ·{' '}
                        {item.normalizedUrl || item.originalUrl}
                      </SText>
                    }
                  />
                  <SText variant="caption" sx={{ display: 'block', pl: 4 }}>
                    Tipo sugerido: {SOURCE_TYPE_LABELS[item.suggestedSourceType]}{' '}
                    · Força: {SOURCE_STRENGTH_LABELS[item.suggestedStrength]}
                  </SText>
                  {item.strengthRationale && (
                    <SText
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', pl: 4 }}
                    >
                      {item.strengthRationale}
                    </SText>
                  )}
                  {item.warning && (
                    <SText
                      variant="caption"
                      color="warning.main"
                      sx={{ display: 'block', pl: 4 }}
                    >
                      {item.warning}
                    </SText>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <SButton variant="outlined" text="Cancelar" onClick={onClose} />
        <SButton
          variant="contained"
          text="Adicionar selecionadas"
          onClick={handleConfirm}
          disabled={!Object.values(selected).some(Boolean)}
        />
      </DialogActions>
    </Dialog>
  );
};
