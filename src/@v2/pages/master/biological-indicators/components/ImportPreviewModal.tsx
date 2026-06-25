import { FC } from 'react';

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type {
  ImportPreviewClassification,
  ImportPreviewResult,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';

type Props = {
  open: boolean;
  isLoading: boolean;
  result: ImportPreviewResult | null;
  onClose: () => void;
};

type ChipColor =
  | 'default'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'secondary';

const CLASSIFICATION_LABELS: Record<ImportPreviewClassification, string> = {
  UNCHANGED: 'Sem alteração',
  NEW: 'Nova',
  UPDATED: 'Alterada',
  DEPRECATED_CANDIDATE: 'Candidata a obsoleta',
  INVALID: 'Inválida',
  CONFLICT: 'Conflito',
};

const CLASSIFICATION_COLORS: Record<ImportPreviewClassification, ChipColor> = {
  UNCHANGED: 'default',
  NEW: 'success',
  UPDATED: 'info',
  DEPRECATED_CANDIDATE: 'warning',
  INVALID: 'error',
  CONFLICT: 'error',
};

const TotalCard: FC<{ label: string; value: number; color?: ChipColor }> = ({
  label,
  value,
  color = 'default',
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: 1.5,
      minWidth: 120,
      flex: '1 1 120px',
      textAlign: 'center',
    }}
  >
    <Typography variant="h6" color={color === 'default' ? 'text.primary' : color}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

export const ImportPreviewModal: FC<Props> = ({
  open,
  isLoading,
  result,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Prévia da importação normativa
        <Typography variant="body2" color="text.secondary">
          Esta prévia é apenas leitura (dry-run). Nenhuma alteração é gravada no
          banco.
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && result && (
          <Box display="flex" flexDirection="column" gap={2}>
            {result.fileName && (
              <Typography variant="body2" color="text.secondary">
                Arquivo: <strong>{result.fileName}</strong>
              </Typography>
            )}

            <Box display="flex" flexWrap="wrap" gap={1}>
              <TotalCard label="Linhas lidas" value={result.totals.read} />
              <TotalCard label="Válidas" value={result.totals.valid} color="success" />
              <TotalCard label="Inválidas" value={result.totals.invalid} color="error" />
              <TotalCard label="Novas" value={result.totals.new} color="success" />
              <TotalCard label="Alteradas" value={result.totals.updated} color="info" />
              <TotalCard label="Sem alteração" value={result.totals.unchanged} />
              <TotalCard
                label="Candidatas a obsoletas"
                value={result.totals.deprecatedCandidate}
                color="warning"
              />
              <TotalCard label="Conflitos" value={result.totals.conflict} color="error" />
            </Box>

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Linha</TableCell>
                  <TableCell>Classificação</TableCell>
                  <TableCell>Substância</TableCell>
                  <TableCell>Âncora</TableCell>
                  <TableCell>Diferenças / Erros</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.lines.map((line, index) => (
                  <TableRow key={`${line.rowNumber}-${index}`}>
                    <TableCell>
                      {line.rowNumber === -1 ? '—' : line.rowNumber}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="filled"
                        label={CLASSIFICATION_LABELS[line.classification]}
                        color={CLASSIFICATION_COLORS[line.classification]}
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{line.substanceName || '—'}</TableCell>
                    <TableCell>{line.anchorUsed}</TableCell>
                    <TableCell>
                      {line.errors.length > 0 && (
                        <Typography variant="caption" color="error" component="div">
                          {line.errors
                            .map((e) =>
                              e.field && e.field !== '_row'
                                ? `${e.field}: ${e.message}`
                                : e.message,
                            )
                            .join(' • ')}
                        </Typography>
                      )}
                      {line.fieldChanges.length > 0 && (
                        <Box
                          display="flex"
                          flexDirection="column"
                          gap={0.5}
                          mt={0.5}
                        >
                          {line.fieldChanges.map((change) => (
                            <Typography
                              key={change.field}
                              variant="caption"
                              component="div"
                            >
                              <strong>{change.field}</strong>: {change.from}{' '}
                              <Box component="span" color="text.secondary">
                                →
                              </Box>{' '}
                              {change.to}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {line.fieldChanges.length === 0 &&
                        line.changedFields.length > 0 && (
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {line.changedFields.map((field) => (
                              <Chip
                                key={field}
                                size="small"
                                variant="outlined"
                                label={field}
                              />
                            ))}
                          </Box>
                        )}
                      {line.errors.length === 0 &&
                        line.changedFields.length === 0 &&
                        '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {!isLoading && !result && (
          <Typography variant="body2" color="text.secondary" py={4}>
            Selecione uma planilha para gerar a prévia.
          </Typography>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          px: 3,
          py: 1.5,
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Prévia concluída — nenhuma alteração foi gravada.
        </Typography>
        <Button variant="outlined" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
