import React, { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { browseTechnicalAiEvidenceSuggestions } from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.service';
import type {
  CharacterizationTechnicalRecordSourceInput,
  TechnicalAiEvidenceSuggestion,
} from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.types';

import {
  SOURCE_STRENGTH_LABELS,
  SOURCE_TYPE_LABELS,
} from './technical-traceability.labels';

type AiEvidenceImportDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  existingUrls: string[];
  onConfirm: (sources: CharacterizationTechnicalRecordSourceInput[]) => void;
};

export const AiEvidenceImportDialog: React.FC<AiEvidenceImportDialogProps> = ({
  open,
  onClose,
  companyId,
  workspaceId,
  characterizationId,
  existingUrls,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    TechnicalAiEvidenceSuggestion[]
  >([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await browseTechnicalAiEvidenceSuggestions({
          companyId,
          workspaceId,
          characterizationId,
          excludeUrls: existingUrls,
        });
        if (cancelled) return;
        setSuggestions(result.suggestions);
        const next: Record<string, boolean> = {};
        result.suggestions.forEach((item) => {
          next[item.id] =
            item.verified &&
            !item.alreadyRegistered &&
            item.kind !== 'URL_FAILED';
        });
        setSelected(next);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar as evidências da IA.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, companyId, workspaceId, characterizationId, existingUrls]);

  const handleConfirm = () => {
    const today = new Date().toISOString().slice(0, 10);
    const sources: CharacterizationTechnicalRecordSourceInput[] = [];

    suggestions.forEach((item) => {
      if (!selected[item.id]) return;
      if (item.kind === 'URL_FAILED') return;

      sources.push({
        sourceType: item.suggestedSourceType,
        sourceStrength: item.suggestedStrength,
        title: item.title,
        fileName: item.fileName,
        url: item.url,
        accessedAt: today,
        applicationInCharacterization:
          item.kind === 'PHOTO'
            ? 'Serviu como apoio visual.'
            : item.kind === 'TEMPORARY_PDF'
              ? 'Referência textual ao PDF temporário do Assistente IA.'
              : 'Fundamentou análise com apoio do Assistente IA interno.',
      });
    });

    onConfirm(sources);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Evidências do Assistente IA</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Origem: Assistente IA interno do SimpleSST. Revise e selecione o que
          deseja importar. URLs com falha não podem ser tratadas como fontes
          verificadas.
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <SText variant="body2" color="text.secondary">
            Carregando evidências...
          </SText>
        )}

        {!loading && !suggestions.length && (
          <SText variant="body2" color="text.secondary">
            Nenhuma evidência identificável nas execuções do Assistente IA.
          </SText>
        )}

        {suggestions.map((item) => (
          <Box
            key={item.id}
            sx={{
              mb: 1.5,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              opacity: item.kind === 'URL_FAILED' ? 0.7 : 1,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(selected[item.id])}
                  disabled={item.kind === 'URL_FAILED' || item.alreadyRegistered}
                  onChange={(_, checked) =>
                    setSelected((prev) => ({ ...prev, [item.id]: checked }))
                  }
                />
              }
              label={
                <SText variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title || item.url || item.fileName || 'Evidência'}
                </SText>
              }
            />
            <SFlex gap={0.75} flexWrap="wrap" sx={{ pl: 4, mb: 0.5 }}>
              <Chip
                size="small"
                label={
                  item.kind === 'URL_SUCCESS'
                    ? 'URL lida com sucesso'
                    : item.kind === 'URL_FAILED'
                      ? 'URL com falha'
                      : item.kind === 'TEMPORARY_PDF'
                        ? 'PDF temporário'
                        : item.kind === 'PHOTO'
                          ? 'Fotografia'
                          : 'Mencionada'
                }
                color={item.verified ? 'success' : 'warning'}
              />
              <Chip
                size="small"
                variant="outlined"
                label={SOURCE_TYPE_LABELS[item.suggestedSourceType]}
              />
              <Chip
                size="small"
                variant="outlined"
                label={SOURCE_STRENGTH_LABELS[item.suggestedStrength]}
              />
              {item.alreadyRegistered && (
                <Chip size="small" label="Já cadastrada" color="default" />
              )}
            </SFlex>
            <SText variant="caption" color="text.secondary" sx={{ display: 'block', pl: 4 }}>
              {item.originLabel}
              {item.url ? ` · ${item.url}` : ''}
            </SText>
            {item.strengthRationale && (
              <SText variant="caption" sx={{ display: 'block', pl: 4 }}>
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
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <SButton variant="outlined" text="Cancelar" onClick={onClose} />
        <SButton
          variant="contained"
          text="Importar selecionadas"
          onClick={handleConfirm}
          disabled={!Object.values(selected).some(Boolean)}
        />
      </DialogActions>
    </Dialog>
  );
};
