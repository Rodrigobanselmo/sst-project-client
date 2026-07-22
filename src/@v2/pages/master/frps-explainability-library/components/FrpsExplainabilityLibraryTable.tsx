import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

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
}: {
  rows: FrpsLibraryTableRow[];
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
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
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
                  variant={row.status === 'NEVER_GENERATED' ? 'outlined' : 'filled'}
                />
              </TableCell>
              <TableCell>{row.updatedAtLabel}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
