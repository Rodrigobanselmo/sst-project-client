import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { getFrpsLibraryRowActions } from '@v2/services/forms/frps-explainability-library';

import type { FrpsLibraryTableRow } from '../frps-explainability-library-filters.util';

function statusColor(
  status: FrpsLibraryTableRow['status'],
): 'default' | 'warning' | 'success' | 'error' {
  switch (status) {
    case 'VALIDATED':
      return 'success';
    case 'DRAFT_AI':
      return 'warning';
    case 'REJECTED':
      return 'error';
    default:
      return 'default';
  }
}

export function FrpsExplainabilityLibraryTable({
  rows,
  generatingRowId,
  onGenerate,
  onView,
}: {
  rows: FrpsLibraryTableRow[];
  generatingRowId: string | null;
  onGenerate: (row: FrpsLibraryTableRow) => void;
  onView: (row: FrpsLibraryTableRow) => void;
}) {
  if (!rows.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Nenhum item do catálogo system encontrado para o recorte atual.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell width={130}>Tipo</TableCell>
            <TableCell>Fator de risco</TableCell>
            <TableCell width={140}>Subtipo</TableCell>
            <TableCell width={130}>Status</TableCell>
            <TableCell width={120}>Atualizado</TableCell>
            <TableCell width={180} align="right">
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const actions = getFrpsLibraryRowActions(
              row.status,
              row.conceptualExplanationId,
            );
            const isGenerating = generatingRowId === row.id;

            return (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {row.name}
                  </Typography>
                </TableCell>
                <TableCell>{row.typeLabel}</TableCell>
                <TableCell>{row.riskName}</TableCell>
                <TableCell>{row.subtypeLabel}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.statusLabel}
                    color={statusColor(row.status)}
                    variant={
                      row.status === 'NEVER_GENERATED' ? 'outlined' : 'filled'
                    }
                  />
                </TableCell>
                <TableCell>{row.updatedAtLabel}</TableCell>
                <TableCell align="right">
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    gap={0.75}
                    flexWrap="wrap"
                  >
                    {actions.canView ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onView(row)}
                        disabled={isGenerating}
                      >
                        Visualizar
                      </Button>
                    ) : null}
                    {actions.canGenerate ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onGenerate(row)}
                        disabled={isGenerating || Boolean(generatingRowId)}
                        startIcon={
                          isGenerating ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : undefined
                        }
                      >
                        {isGenerating ? 'Gerando…' : 'Gerar'}
                      </Button>
                    ) : null}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
