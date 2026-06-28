import { FC, useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AcgihBeiComparisonDecisionEnum,
  IAcgihBeiComparisonRow,
} from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';

import {
  comparisonDecisionExplanations,
  comparisonDecisionLabels,
  comparisonStatusLabels,
} from '../acgih-bei-comparison-labels';

type Props = {
  row: IAcgihBeiComparisonRow | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (params: {
    decision: AcgihBeiComparisonDecisionEnum;
    technicalNote: string;
  }) => void;
};

const summaryLine = (label: string, value?: string | null) =>
  value ? `${label}: ${value}` : null;

export const AcgihBeiComparisonReviewDialog: FC<Props> = ({
  row,
  isSaving,
  onClose,
  onConfirm,
}) => {
  const [decision, setDecision] = useState<AcgihBeiComparisonDecisionEnum | ''>(
    '',
  );
  const [note, setNote] = useState('');

  useEffect(() => {
    if (row) {
      setDecision(row.review?.decision ?? '');
      setNote(row.review?.technicalNote ?? '');
    }
  }, [row]);

  const noteTrimmed = note.trim();
  const canSave = Boolean(decision) && noteTrimmed.length > 0 && !isSaving;

  const handleConfirm = () => {
    if (!canSave || !decision) return;
    onConfirm({ decision, technicalNote: noteTrimmed });
  };

  const acgihSummary = row
    ? [
        summaryLine('Substância', row.substanceName),
        summaryLine('CAS', row.cas),
        summaryLine('Determinante', row.determinant),
        summaryLine('Matriz', row.biologicalMatrix),
        summaryLine('Coleta', row.samplingTime),
        summaryLine(
          'Valor',
          row.beiValue
            ? `${row.beiValue}${row.unit ? ` ${row.unit}` : ''}`
            : null,
        ),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const nr7Summary = row
    ? [
        summaryLine('Indicador NR-7', row.nr7IndicatorName),
        summaryLine('Substância NR-7', row.nr7SubstanceName),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <Dialog open={Boolean(row)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {row?.review ? 'Editar decisão técnica' : 'Registrar decisão técnica'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Registrar a decisão técnica é uma camada de curadoria sobre a
            comparação. <strong>Não altera</strong> a classificação calculada,
            nem as bases NR-7, ACGIH/BEI, Biblioteca, fonte complementar, regras
            ou status.
          </Alert>

          {row && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contexto da linha
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Classificação atual:{' '}
                {comparisonStatusLabels[row.comparisonStatus]}
              </Typography>
              {acgihSummary && (
                <Typography variant="caption" color="text.secondary" display="block">
                  ACGIH/BEI — {acgihSummary}
                </Typography>
              )}
              {nr7Summary && (
                <Typography variant="caption" color="text.secondary" display="block">
                  NR-7 — {nr7Summary}
                </Typography>
              )}
              {row.technicalDiff && (
                <Typography variant="caption" color="text.secondary" display="block">
                  Diferenças: {row.technicalDiff}
                </Typography>
              )}
            </Box>
          )}

          <TextField
            select
            label="Decisão técnica"
            value={decision}
            onChange={(event) =>
              setDecision(event.target.value as AcgihBeiComparisonDecisionEnum)
            }
            size="small"
            fullWidth
          >
            {Object.values(AcgihBeiComparisonDecisionEnum).map((value) => (
              <MenuItem key={value} value={value}>
                {comparisonDecisionLabels[value]}
              </MenuItem>
            ))}
          </TextField>

          {decision && (
            <Typography variant="caption" color="text.secondary">
              {comparisonDecisionExplanations[decision]}
            </Typography>
          )}

          <TextField
            label="Nota técnica (obrigatória)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={4}
            required
            error={note.length > 0 && noteTrimmed.length === 0}
            helperText="Descreva tecnicamente a conclusão. A nota é obrigatória para salvar."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!canSave}
          onClick={handleConfirm}
        >
          Salvar decisão
        </Button>
      </DialogActions>
    </Dialog>
  );
};
