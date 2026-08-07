import { FC, useEffect, useState } from 'react';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  RISK_HARD_DELETE_CONFIRMATION,
  RiskDeletionImpactReport,
} from 'core/services/hooks/mutations/checklist/risk/riskHardDelete.service';
import {
  useMutFetchRiskDeletionImpact,
  useMutHardDeleteRisk,
} from 'core/services/hooks/mutations/checklist/risk/useMutHardDeleteRisk';

type Props = {
  open: boolean;
  riskId: string | null;
  riskName?: string;
  onClose: () => void;
  onDeleted?: () => void;
};

export const RiskHardDeleteImpactModal: FC<Props> = ({
  open,
  riskId,
  riskName,
  onClose,
  onDeleted,
}) => {
  const [confirmation, setConfirmation] = useState('');
  const [report, setReport] = useState<RiskDeletionImpactReport | null>(null);
  const impactMut = useMutFetchRiskDeletionImpact();
  const deleteMut = useMutHardDeleteRisk();

  useEffect(() => {
    if (!open || !riskId) {
      setReport(null);
      setConfirmation('');
      return;
    }
    impactMut.mutate(riskId, {
      onSuccess: (data) => setReport(data),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, riskId]);

  const canConfirm =
    confirmation.trim() === RISK_HARD_DELETE_CONFIRMATION && !!riskId;

  const handleDelete = () => {
    if (!riskId || !canConfirm) return;
    deleteMut.mutate(
      { riskId, confirmation: confirmation.trim() },
      {
        onSuccess: () => {
          onDeleted?.();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Excluir definitivamente</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Fator: <strong>{report?.riskName || riskName || '—'}</strong>
        </Typography>

        {impactMut.isLoading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        )}

        {report && (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Ocorrências no inventário:{' '}
              <strong>{report.inventoryOccurrenceTotal}</strong>
              {' · '}
              Itens de plano de ação:{' '}
              <strong>{report.actionPlanItemTotal}</strong>
            </Typography>

            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Estabelecimento</TableCell>
                  <TableCell align="right">Inventário</TableCell>
                  <TableCell>Plano de ação</TableCell>
                  <TableCell align="right">Itens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      Nenhum impacto operacional de inventário/plano encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  report.companies.map((row) => (
                    <TableRow
                      key={`${row.companyId}-${row.workspaceId || 'none'}`}
                    >
                      <TableCell>{row.companyName}</TableCell>
                      <TableCell>{row.workspaceName || '—'}</TableCell>
                      <TableCell align="right">{row.inventoryCount}</TableCell>
                      <TableCell>
                        {row.hasActionPlan ? 'Sim' : 'Não'}
                      </TableCell>
                      <TableCell align="right">
                        {row.actionPlanItemCount}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Esta ação é irreversível e não altera documentos já emitidos.
              Digite exatamente{' '}
              <strong>{RISK_HARD_DELETE_CONFIRMATION}</strong> para confirmar.
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="Confirmação"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          color="error"
          variant="contained"
          disabled={!canConfirm || deleteMut.isLoading}
          onClick={handleDelete}
        >
          {deleteMut.isLoading ? 'Excluindo…' : 'Excluir definitivamente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
