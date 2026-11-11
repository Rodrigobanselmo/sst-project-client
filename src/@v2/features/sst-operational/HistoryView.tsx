import axios from 'axios';
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
  const isAssessment = table === 'RiskFactorData';
  const response =
    history.isError && history.error && axios.isAxiosError(history.error)
      ? history.error.response
      : undefined;
  const hasHistoryData =
    Array.isArray(history.data?.periods) &&
    Array.isArray(history.data?.revisions);
  const hasNoHistory =
    (hasHistoryData && history.data.periods.length === 0) ||
    (response?.status === 404 &&
      response.data?.message ===
        'O cadastro ainda não possui uma condição com vigência registrada.');
  const accessDenied = response?.status === 403;
  const requiresDirectContract =
    accessDenied &&
    response.data?.message === 'Sem contrato direto ativo com a empresa solicitada.';
  const accessMessage = requiresDirectContract
    ? 'A consulta do histórico exige um contrato direto ativo entre a organização da sua sessão e esta empresa.'
    : 'Você não tem acesso ao histórico deste cadastro.';
  const closeButton = <Button type="button" onClick={onClose}>Voltar ao cadastro</Button>;

  return (
    <Dialog
      open
      onClose={onClose}
      onClick={(event) => event.stopPropagation()}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ px: 12, pt: 12, pb: 6 }}>
        {isAssessment
          ? 'Histórico de vigência da avaliação'
          : 'Histórico do cadastro'}
      </DialogTitle>
      <DialogContent sx={{ px: 12, pb: 12 }}>
        {history.isLoading ? (
          <Box role="status">Consultando histórico…</Box>
        ) : hasNoHistory ? (
          <Stack spacing={4} alignItems="flex-start">
            <Alert severity="info">
              {isAssessment
                ? 'Ainda não há períodos registrados para esta avaliação. O histórico começa quando uma condição de exposição é registrada com data de início.'
                : 'Ainda não há períodos de vigência registrados para este cadastro.'}
            </Alert>
            {closeButton}
          </Stack>
        ) : history.isError || !hasHistoryData ? (
          <Stack spacing={4} alignItems="flex-start">
            <Alert severity="error">
              {accessDenied
                ? accessMessage
                : 'Não foi possível consultar o histórico agora. Tente novamente.'}
            </Alert>
            <Stack direction="row" spacing={2}>
              {!accessDenied && (
                <Button
                  type="button"
                  disabled={history.isFetching}
                  onClick={() => void history.refetch()}
                >
                  Tentar novamente
                </Button>
              )}
              {closeButton}
            </Stack>
          </Stack>
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
            {closeButton}
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
