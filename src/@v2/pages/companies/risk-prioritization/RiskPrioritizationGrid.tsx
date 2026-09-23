import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  RiskPrioritizationBrowseResult,
  RiskPrioritizationCell,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';

import {
  buildPrioritizationCellTooltip,
  cellKey,
  contrastTextColor,
  indexPrioritizationCells,
  normalizeCssColor,
} from './risk-prioritization.util';

const STICKY_COL_WIDTH = 220;
const RISK_COL_WIDTH = 72;

export function RiskPrioritizationGrid({
  data,
  onCellClick,
}: {
  data: RiskPrioritizationBrowseResult;
  onCellClick: (cell: RiskPrioritizationCell) => void;
}) {
  const byKey = indexPrioritizationCells(data.cells);

  return (
    <TableContainer
      sx={{
        maxHeight: 'calc(100vh - 280px)',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Table stickyHeader size="small" sx={{ minWidth: STICKY_COL_WIDTH + data.columns.length * RISK_COL_WIDTH }}>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                bgcolor: 'background.paper',
                minWidth: STICKY_COL_WIDTH,
                maxWidth: STICKY_COL_WIDTH,
                fontWeight: 700,
                borderRight: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              GSE / Elemento
            </TableCell>
            {data.columns.map((column) => (
              <TableCell
                key={column.riskId}
                align="center"
                sx={{
                  minWidth: RISK_COL_WIDTH,
                  maxWidth: 120,
                  px: 0.75,
                  verticalAlign: 'bottom',
                }}
              >
                <Tooltip title={column.name} placement="top">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.2,
                    }}
                  >
                    {column.name}
                  </Typography>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  minWidth: STICKY_COL_WIDTH,
                  maxWidth: STICKY_COL_WIDTH,
                  borderRight: '1px solid',
                  borderColor: 'grey.200',
                  whiteSpace: 'pre-line',
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {row.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.kind === 'REAL_GSE' ? 'GSE' : 'Elemento'}
                </Typography>
              </TableCell>
              {data.columns.map((column) => {
                const cell = byKey.get(cellKey(row.id, column.riskId));
                if (!cell) {
                  return (
                    <TableCell
                      key={column.riskId}
                      align="center"
                      sx={{ bgcolor: 'grey.50' }}
                    />
                  );
                }

                const clickable = cell.origins.length > 0;
                const cellColor = normalizeCssColor(cell.color);
                const textColor = contrastTextColor(cellColor);
                return (
                  <TableCell
                    key={column.riskId}
                    align="center"
                    onClick={clickable ? () => onCellClick(cell) : undefined}
                    sx={{
                      cursor: clickable ? 'pointer' : 'default',
                      bgcolor: cellColor || 'grey.100',
                      color: textColor,
                      fontWeight: cell.isPrioritized ? 800 : 700,
                      outline: cell.isPrioritized
                        ? '2px solid rgba(180, 40, 40, 0.55)'
                        : undefined,
                      outlineOffset: -2,
                      backgroundImage: cell.isQuantity
                        ? 'repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 12px)'
                        : undefined,
                      px: 0.5,
                    }}
                  >
                    <Tooltip
                      title={
                        <Box sx={{ whiteSpace: 'pre-line' }}>
                          {buildPrioritizationCellTooltip({
                            riskName: column.name,
                            cell,
                          })}
                        </Box>
                      }
                    >
                      <Typography
                        component="span"
                        sx={{
                          fontSize: cell.abbreviation.length > 3 ? 11 : 13,
                          fontWeight: 'inherit',
                          color: 'inherit',
                          letterSpacing: 0.3,
                        }}
                      >
                        {cell.abbreviation}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
