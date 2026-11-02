import { useQuery } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import { sstGet } from './api';
import { useSstAccess } from './access';
import { StructuralRevisionDialog } from './StructuralRevisionDialog';
import type { StructuralTable } from './structural-review-model';
export function HistoryView({
  companyId,
  table,
  id,
  slot = 'default',
  onClose,
}: {
  companyId: string;
  table: string;
  id: string;
  slot?: string;
  onClose: () => void;
}) {
  const [revision, setRevision] = useState('');
  const [correctionFrom, setCorrectionFrom] = useState<string>();
  const access = useSstAccess();
  const canReview =
    access.canConfigure &&
    [
      'Hierarchy',
      'HomogeneousGroup',
      'CompanyCharacterization',
      'Workspace',
    ].includes(table);
  const history = useQuery(
    ['sst-source-history', companyId, table, id, slot, revision],
    () =>
      sstGet(
        companyId,
        `/sst-operational/history?table=${table}&id=${encodeURIComponent(id)}&slot=${encodeURIComponent(slot)}&effectiveOn=${new Date().toISOString().slice(0, 10)}${revision ? '&revisionId=' + revision : ''}`,
      ),
    { retry: false },
  );
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ px: 12, pt: 12, pb: 6 }}>
        Histórico do cadastro
      </DialogTitle>
      <DialogContent sx={{ px: 12, pb: 12 }}>
        {history.isError ? (
          <Alert severity="info">
            Este cadastro ainda não possui uma condição com vigência registrada.
            Confira as datas no formulário de origem.
          </Alert>
        ) : (
          <Stack spacing={8} useFlexGap>
            <Alert severity="info">
              Na data de fim de um período, passa a valer a condição seguinte.
              Revisões anteriores podem ser consultadas sem alterar o cadastro.
            </Alert>
            <TextField
              select
              label="Revisão consultada"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
            >
              <MenuItem value="">Atual</MenuItem>
              {history.data?.revisions.map((r: any) => (
                <MenuItem key={r.id} value={r.id}>
                  Revisão {r.number} — {r.reason}
                </MenuItem>
              ))}
            </TextField>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Início</TableCell>
                    <TableCell>Fim</TableCell>
                    <TableCell>Condição registrada</TableCell>
                    {canReview && <TableCell>Revisão</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.data?.periods.map((p: any) => {
                    const a = p.assessmentSnapshot;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>{p.effectiveFrom?.slice(0, 10)}</TableCell>
                        <TableCell>
                          {p.effectiveTo?.slice(0, 10) || 'Em aberto'}
                        </TableCell>
                        <TableCell>
                          {p.referenceSnapshot?.name ||
                            a?.details?.source?.riskFactor?.name ||
                            a?.riskSnapshot?.name ||
                            (p.employmentSnapshot
                              ? 'Vínculo do empregado'
                              : 'Lotação')}
                          {a?.measurementRevision &&
                            ` — ${a.measurementRevision.value} ${a.measurementRevision.unit}`}
                        </TableCell>
                        {canReview && (
                          <TableCell>
                            <Button
                              onClick={() =>
                                setCorrectionFrom(p.effectiveFrom?.slice(0, 10))
                              }
                            >
                              Corrigir este período
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <Button onClick={onClose}>Voltar ao cadastro</Button>
          </Stack>
        )}
      </DialogContent>
      {correctionFrom && (
        <StructuralRevisionDialog
          companyId={companyId}
          target={{ table: table as StructuralTable, id }}
          action="METADATA"
          effectiveFrom={correctionFrom}
          onClose={() => setCorrectionFrom(undefined)}
          onApplied={() => {
            setCorrectionFrom(undefined);
            void history.refetch();
          }}
        />
      )}
    </Dialog>
  );
}
