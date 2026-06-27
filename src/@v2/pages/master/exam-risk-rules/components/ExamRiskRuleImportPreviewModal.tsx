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
  ExamRiskRuleImportClassification,
  IExamRiskRuleImportPreviewResult,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { ExamRiskRuleApplyConfirmDialog } from './ExamRiskRuleApplyConfirmDialog';

type Props = {
  open: boolean;
  isLoading: boolean;
  result: IExamRiskRuleImportPreviewResult | null;
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

const CLASSIFICATION_LABELS: Record<ExamRiskRuleImportClassification, string> = {
  CREATE: 'Criar',
  UPDATE: 'Atualizar',
  UNCHANGED: 'Sem alteração',
  REJECTED: 'Rejeitada',
  CONFLICT: 'Conflito',
  INVALID: 'Inválida',
};

const CLASSIFICATION_COLORS: Record<ExamRiskRuleImportClassification, ChipColor> =
  {
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
    sx={{ p: 1.5, minWidth: 110, flex: '1 1 110px', textAlign: 'center' }}
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

const shortId = (value: string) => (value ? `${value.slice(0, 8)}…` : '—');

export const ExamRiskRuleImportPreviewModal: FC<Props> = ({
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
        Prévia da importação — biblioteca Regras Exame × Risco
        <Typography variant="body2" color="text.secondary">
          Prévia apenas leitura (dry-run). Nenhuma alteração é gravada. Só a
          biblioteca global é tocada — empresas, ExamToRisk e Tabela 27 oficial
          permanecem intocados.
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
                  <TableCell>Regra</TableCell>
                  <TableCell>Exame</TableCell>
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
                    <TableCell>
                      <Typography variant="caption" component="div">
                        {line.referenceName || shortId(line.ruleId)}
                      </Typography>
                      {line.scope && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          {line.scope}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{line.examName || '—'}</TableCell>
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
                      {line.warnings.length > 0 && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          component="div"
                        >
                          {line.warnings.join(' • ')}
                        </Typography>
                      )}
                      {line.errors.length === 0 &&
                        line.fieldChanges.length === 0 &&
                        line.warnings.length === 0 &&
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

      <ExamRiskRuleApplyConfirmDialog
        open={confirmOpen}
        isApplying={isApplying}
        summary={{
          create: totals?.create ?? 0,
          update: totals?.update ?? 0,
        }}
        onClose={() => {
          if (!isApplying) setConfirmOpen(false);
        }}
        onConfirm={handleConfirm}
      />
    </Dialog>
  );
};
