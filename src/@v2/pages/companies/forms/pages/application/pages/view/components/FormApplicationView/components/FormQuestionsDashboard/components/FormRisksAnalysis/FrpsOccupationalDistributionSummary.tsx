import { Box, Tooltip, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';

import type { FrpsOccupationalDistribution } from './frps-occupational-distribution.util';

function formatShare(percentage: number | null): string {
  if (percentage == null) return '—';
  return `${percentage.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}%`;
}

export function FrpsOccupationalDistributionSummary({
  distribution,
}: {
  distribution: FrpsOccupationalDistribution;
}) {
  const presentation = useSystemRiskMatrixPresentation();
  const barLevels = distribution.levels.filter((level) => level.count > 0);

  return (
    <Box component="details" open sx={{ color: 'text.primary', '& > summary': { cursor: 'pointer', listStyle: 'none', '&::-webkit-details-marker': { display: 'none' }, '&:focus-visible': { outline: '2px solid', outlineColor: 'text.secondary', outlineOffset: 4, borderRadius: 999 } } }}>
      <Box component="summary" aria-label="Distribuição dos riscos ocupacionais: expandir ou recolher legenda" title="Clique para expandir ou recolher a legenda da distribuição">
      <Box
        role="img"
        aria-label={
          distribution.classified === 0
            ? 'Nenhum diagnóstico classificado'
            : barLevels
                .map(
                  (level) =>
                    `${level.label}: ${level.count} (${formatShare(level.percentage)})`,
                )
                .join(', ')
        }
        sx={{
          display: 'flex',
          height: 12,
          borderRadius: 999,
          overflow: 'hidden',
          bgcolor: 'action.hover',
        }}
      >
        {barLevels.map((level) => {
          const chip = resolveSystemOccupationalChipColors(
            level.level,
            presentation,
          );
          return (
            <Tooltip
              key={level.level}
              title={`${level.label}: ${level.count} (${formatShare(level.percentage)})`}
            >
              <Box
                sx={{
                  flexGrow: level.count,
                  flexBasis: 0,
                  minWidth: 0,
                  bgcolor: chip.bgcolor,
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      </Box>
      <TableContainer sx={{ mt: 6 }}>
        <Table size="small" aria-label="Distribuição por categoria de risco ocupacional" sx={{ backgroundColor: 'transparent', '& thead, & tbody, & tr, & th, & td': { backgroundColor: 'transparent !important' }, '& tr:hover': { backgroundColor: 'transparent !important' }, '& th, & td': { fontSize: 14, py: 4, px: 5, borderColor: 'divider', color: 'text.primary' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 32 }}><Box component="span" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>Cor</Box></TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="center">Quantidade</TableCell>
              <TableCell align="center">Porcentagem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distribution.levels.map((level) => {
              const chip = resolveSystemOccupationalChipColors(level.level, presentation);
              return (
                <TableRow key={level.level}>
                  <TableCell><Box aria-hidden="true" sx={{ width: 28, height: 22, borderRadius: 1, bgcolor: chip.bgcolor }} /></TableCell>
                  <TableCell component="th" scope="row">{level.label}</TableCell>
                  <TableCell align="center">{level.count}</TableCell>
                  <TableCell align="center">{formatShare(level.percentage)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 5, lineHeight: 1.7 }}>
        Total {distribution.total} · Classificados {distribution.classified} · Não
        informados {distribution.unclassified}
      </Typography>
    </Box>
  );
}
