import { FC, useMemo } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { ChemicalOccupationalEnrichResult } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  buildOccupationalFormPatch,
  buildOccupationalReviewRows,
  type OccupationalLimitFormSnapshot,
  type OccupationalReviewRow,
} from './occupational-limit-apply.util';

type OccupationalLimitReviewDialogProps = {
  open: boolean;
  result: ChemicalOccupationalEnrichResult | null;
  current: OccupationalLimitFormSnapshot;
  onClose: () => void;
  onApply: (patch: OccupationalLimitFormSnapshot) => void;
};

function actionLabel(row: OccupationalReviewRow): string {
  switch (row.action) {
    case 'FILL':
      return 'Preencher';
    case 'SKIP_EXISTING':
      return 'Preservar (já preenchido)';
    case 'SKIP_DIVERGENCE':
      return 'Divergência — não sobrescrever';
    case 'SKIP_UNIT_REVIEW':
      return 'Revisão de unidade';
    case 'SKIP_UNPARSEABLE':
      return 'Não aplicável';
    case 'SKIP_EMPTY_SOURCE':
    default:
      return 'Sem valor na fonte';
  }
}

function actionColor(
  row: OccupationalReviewRow,
): 'success' | 'warning' | 'info' | 'default' {
  if (row.action === 'FILL') return 'success';
  if (row.action === 'SKIP_DIVERGENCE' || row.action === 'SKIP_UNIT_REVIEW') {
    return 'warning';
  }
  if (row.action === 'SKIP_EXISTING') return 'info';
  return 'default';
}

export const OccupationalLimitReviewDialog: FC<
  OccupationalLimitReviewDialogProps
> = ({ open, result, current, onClose, onApply }) => {
  const rows = useMemo(
    () => (result ? buildOccupationalReviewRows(result, current) : []),
    [result, current],
  );

  const fillCount = rows.filter((r) => r.action === 'FILL').length;
  const divergenceCount = rows.filter(
    (r) => r.action === 'SKIP_DIVERGENCE' || r.divergent,
  ).length;

  const handleApply = () => {
    if (!result) return;
    const patch = buildOccupationalFormPatch(rows, result, current);
    onApply(patch);
  };

  const groups: Array<'NIOSH' | 'OSHA' | 'UNIT'> = ['NIOSH', 'OSHA', 'UNIT'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Revisar limites ocupacionais</DialogTitle>
      <DialogContent dividers>
        {!result ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum resultado.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              CAS {result.identity.cas}
              {result.identity.officialName
                ? ` — ${result.identity.officialName}`
                : ''}
              . Fontes OEL: NIOSH Pocket Guide e OSHA Chemical Database. MW:
              PubChem (preferencial) / Chemical_DB. ACGIH, NR-15 e AIHA WEEL
              não são pesquisados. Nada é salvo automaticamente.
            </Typography>

            {result.occupationalData.targetUnit ? (
              <Alert severity="info">
                Unidade do RiskFactor preservada:{' '}
                <strong>{result.occupationalData.targetUnit}</strong>. Valores
                convertidos para esta unidade quando tecnicamente permitido
                (gases/vapores, 25 °C / 1 atm).
              </Alert>
            ) : null}

            {result.occupationalData.molecularWeight ? (
              <Typography variant="body2" color="text.secondary">
                Peso molecular:{' '}
                {result.occupationalData.molecularWeight.molecularWeight} g/mol
                (fonte: {result.occupationalData.molecularWeight.source}).
                Premissa de conversão: 25 °C / 1 atm.
              </Typography>
            ) : (
              <Alert severity="warning">
                Peso molecular indisponível — conversões ppm↔mg/m³ exigem
                revisão manual.
              </Alert>
            )}

            {result.occupationalData.notFoundMessage ? (
              <Alert severity="info">
                {result.occupationalData.notFoundMessage}
              </Alert>
            ) : null}

            {(result.occupationalData.unitConflict ||
              result.occupationalData.unitReviewRequired) && (
              <Alert severity="warning">
                Unidade exige revisão humana (conflito ou multiunidade sem
                representação segura). Alternativas aparecem abaixo — o campo
                Unidade não será preenchido automaticamente.
              </Alert>
            )}

            {divergenceCount > 0 ? (
              <Alert severity="warning">
                {divergenceCount} campo(s) com valor existente divergente — não
                serão sobrescritos.
              </Alert>
            ) : null}

            {groups.map((group) => {
              const groupRows = rows.filter((r) => r.group === group);
              if (!groupRows.length) return null;
              return (
                <Box key={group}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    {group === 'UNIT' ? 'Unidade' : group}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Campo</TableCell>
                        <TableCell>Atual (SimpleSST)</TableCell>
                        <TableCell>Encontrado (form)</TableCell>
                        <TableCell>Bruto / origem</TableCell>
                        <TableCell>Ação</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupRows.map((row) => (
                        <TableRow
                          key={row.field}
                          sx={{
                            bgcolor:
                              row.action === 'SKIP_DIVERGENCE' ||
                              row.action === 'SKIP_UNIT_REVIEW'
                                ? 'warning.50'
                                : row.action === 'FILL'
                                  ? 'success.50'
                                  : undefined,
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2">{row.label}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {row.currentValue || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {row.foundFormValue
                                ? `${row.foundFormValue}${
                                    row.foundUnit ? ` ${row.foundUnit}` : ''
                                  }`
                                : '—'}
                            </Typography>
                            {row.alternateRepresentations.length > 0 ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Alternativas:{' '}
                                {row.alternateRepresentations
                                  .map((a) => a.rawFragment)
                                  .join(' · ')}
                              </Typography>
                            ) : null}
                            {row.conversion ? (
                              <Box sx={{ mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Valor fonte: {row.conversion.originalValue}{' '}
                                  {row.conversion.originalUnit}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  Convertido p/ padrão RF:{' '}
                                  {row.conversion.convertedValue}{' '}
                                  {row.conversion.convertedUnit}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  display="block"
                                  color="text.secondary"
                                >
                                  MW: {row.conversion.molecularWeight} g/mol (
                                  {row.conversion.molecularWeightSource}) ·{' '}
                                  {row.conversion.temperatureC} °C /{' '}
                                  {row.conversion.pressureAtm} atm ·{' '}
                                  {row.conversion.verificationStatus}
                                </Typography>
                              </Box>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block">
                              {row.foundRaw || '—'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              {row.sourceName || ''}
                              {row.sourceField ? ` / ${row.sourceField}` : ''}
                            </Typography>
                            {row.sourceUrl ? (
                              <Link
                                href={row.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="caption"
                              >
                                referência
                              </Link>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              color={
                                actionColor(row) === 'default'
                                  ? 'text.secondary'
                                  : `${actionColor(row)}.main`
                              }
                            >
                              {actionLabel(row)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              );
            })}

            {(result.occupationalData.warnings || []).slice(0, 6).map((w) => (
              <Typography
                key={w}
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {w}
              </Typography>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleApply}
          disabled={!result || fillCount === 0}
        >
          Aplicar ao formulário
          {fillCount > 0 ? ` (${fillCount})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type CasGateProps = {
  open: boolean;
  onClose: () => void;
};

export const OccupationalLimitCasRequiredDialog: FC<CasGateProps> = ({
  open,
  onClose,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>CAS necessário</DialogTitle>
    <DialogContent>
      <Typography variant="body2">
        Informe um CAS válido para pesquisar limites ocupacionais.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained">
        Entendi
      </Button>
    </DialogActions>
  </Dialog>
);

export const OccupationalLimitSearchBusy: FC<{ loading: boolean }> = ({
  loading,
}) =>
  loading ? (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
      <CircularProgress size={16} />
      <Typography variant="caption" color="text.secondary">
        Consultando NIOSH / OSHA…
      </Typography>
    </Stack>
  ) : null;

