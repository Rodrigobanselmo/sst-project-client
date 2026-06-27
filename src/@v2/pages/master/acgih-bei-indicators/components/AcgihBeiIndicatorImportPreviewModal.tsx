import { FC, useState } from 'react';

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
  AcgihBeiImportClassification,
  IAcgihBeiImportPreviewResult,
} from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { AcgihBeiIndicatorApplyConfirmDialog } from './AcgihBeiIndicatorApplyConfirmDialog';

type Props = {
  open: boolean;
  isLoading: boolean;
  result: IAcgihBeiImportPreviewResult | null;
  onClose: () => void;
  onApply?: () => void;
  isApplying?: boolean;
};

type ChipColor =
  | 'default'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'secondary';

const CLASSIFICATION_LABELS: Record<AcgihBeiImportClassification, string> = {
  CREATE: 'Criar',
  UPDATE: 'Atualizar',
  UNCHANGED: 'Sem alteração',
  REJECTED: 'Rejeitada',
  CONFLICT: 'Conflito',
  INVALID: 'Inválida',
};

const CLASSIFICATION_COLORS: Record<AcgihBeiImportClassification, ChipColor> = {
  CREATE: 'success',
  UPDATE: 'info',
  UNCHANGED: 'default',
  REJECTED: 'error',
  CONFLICT: 'error',
  INVALID: 'error',
};

const TotalCard: FC<{ label: string; value: number; color?: ChipColor }> = ({
  label,
  value,
  color = 'default',
}) => (
  <Paper
    variant="outlined"
    sx={{ p: 1.5, minWidth: 120, flex: '1 1 120px', textAlign: 'center' }}
  >
    <Typography
      variant="h6"
      color={color === 'default' ? 'text.primary' : color}
    >
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

export const AcgihBeiIndicatorImportPreviewModal: FC<Props> = ({
  open,
  isLoading,
  result,
  onClose,
  onApply,
  isApplying = false,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const totals = result?.totals;
  const applicable = totals ? totals.create + totals.update : 0;
  const canApply = Boolean(onApply) && !!result && applicable > 0;

  const handleConfirm = () => {
    if (isApplying) return;
    setConfirmOpen(false);
    onApply?.();
  };

  return (
    <Dialog
      open={open}
      onClose={isApplying ? undefined : onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Prévia da importação — base ACGIH/BEI
        <Typography variant="body2" color="text.secondary">
          Esta prévia é apenas leitura (dry-run). Nenhuma alteração é gravada no
          banco. Nada é aplicado em empresas ou na biblioteca Regras Exame ×
          Risco.
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
              <TotalCard
                label="Válidas"
                value={result.totals.valid}
                color="success"
              />
              <TotalCard
                label="Criar"
                value={result.totals.create}
                color="success"
              />
              <TotalCard
                label="Atualizar"
                value={result.totals.update}
                color="info"
              />
              <TotalCard label="Sem alteração" value={result.totals.unchanged} />
              <TotalCard
                label="Rejeitadas"
                value={result.totals.rejected}
                color="error"
              />
              <TotalCard
                label="Conflitos"
                value={result.totals.conflict}
                color="error"
              />
              <TotalCard
                label="Inválidas"
                value={result.totals.invalid}
                color="error"
              />
            </Box>

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Linha</TableCell>
                  <TableCell>Classificação</TableCell>
                  <TableCell>Substância</TableCell>
                  <TableCell>Determinante</TableCell>
                  <TableCell>Diferenças / Erros / Avisos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.lines.map((line, index) => (
                  <TableRow key={`${line.rowNumber}-${index}`}>
                    <TableCell>{line.rowNumber}</TableCell>
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
                    <TableCell>{line.determinant || '—'}</TableCell>
                    <TableCell>
                      {line.errors.length > 0 && (
                        <Typography
                          variant="caption"
                          color="error"
                          component="div"
                        >
                          {line.errors
                            .map((e) =>
                              e.field ? `${e.field}: ${e.message}` : e.message,
                            )
                            .join(' • ')}
                        </Typography>
                      )}
                      {line.warnings.length > 0 && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          component="div"
                        >
                          {line.warnings.join(' • ')}
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
                      {line.errors.length === 0 &&
                        line.warnings.length === 0 &&
                        line.fieldChanges.length === 0 &&
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
          {canApply
            ? 'Revise as alterações antes de aplicar. Linhas rejeitadas/inválidas/conflito não são aplicadas.'
            : 'Prévia concluída — nenhuma alteração foi gravada.'}
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={onClose} disabled={isApplying}>
            Fechar
          </Button>
          {canApply && (
            <SAuthShow roles={[RoleEnum.MASTER]}>
              <Button
                variant="contained"
                color="warning"
                onClick={() => setConfirmOpen(true)}
                disabled={isApplying}
              >
                Aplicar curadoria
              </Button>
            </SAuthShow>
          )}
        </Box>
      </DialogActions>

      <AcgihBeiIndicatorApplyConfirmDialog
        open={confirmOpen}
        isApplying={isApplying}
        summary={{
          created: totals?.create ?? 0,
          updated: totals?.update ?? 0,
        }}
        onClose={() => {
          if (!isApplying) setConfirmOpen(false);
        }}
        onConfirm={handleConfirm}
      />
    </Dialog>
  );
};
