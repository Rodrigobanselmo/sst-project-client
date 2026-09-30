import { useMemo } from 'react';

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

import { SectorRiskPresence } from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';

import {
  presentSectorRiskPresence,
  SECTOR_RISK_PRESENCE_BAND,
  SECTOR_RISK_PRESENCE_GRID,
  SECTOR_RISK_PRESENCE_INK,
  SECTOR_RISK_PRESENCE_MARK,
  SECTOR_RISK_PRESENCE_SURFACE,
  SectorRiskPresenceOrientation,
} from './sector-risk-presence.presentation';

const NAME_COL_WIDTH = 280;
const MARK_COL_WIDTH = 44;
const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 168;

export function SectorRiskPresenceGrid({
  data,
  orientation,
}: {
  data: SectorRiskPresence;
  orientation: SectorRiskPresenceOrientation;
}) {
  const presentation = useMemo(
    () => presentSectorRiskPresence(data, orientation),
    [data, orientation],
  );
  const { rows, columns, cells } = presentation;

  return (
    <TableContainer
      sx={{
        maxHeight: 'calc(100vh - 280px)',
        overflow: 'auto',
        border: '1px solid',
        borderColor: SECTOR_RISK_PRESENCE_GRID,
        bgcolor: SECTOR_RISK_PRESENCE_SURFACE,
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          width: NAME_COL_WIDTH + columns.length * MARK_COL_WIDTH,
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                top: 0,
                zIndex: 4,
                width: NAME_COL_WIDTH,
                minWidth: NAME_COL_WIDTH,
                maxWidth: NAME_COL_WIDTH,
                height: HEADER_HEIGHT,
                bgcolor: SECTOR_RISK_PRESENCE_BAND,
                color: SECTOR_RISK_PRESENCE_INK,
                borderRight: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                borderBottom: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                fontWeight: 700,
              }}
            >
              {orientation === 'RISKS_IN_ROWS' ? 'Riscos' : 'Setores'}
            </TableCell>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align="center"
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  width: MARK_COL_WIDTH,
                  minWidth: MARK_COL_WIDTH,
                  maxWidth: MARK_COL_WIDTH,
                  height: HEADER_HEIGHT,
                  p: 0.5,
                  bgcolor: SECTOR_RISK_PRESENCE_BAND,
                  borderLeft: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                  borderBottom: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                  borderTop: column.accent ? `3px solid ${column.accent}` : undefined,
                  verticalAlign: 'bottom',
                }}
              >
                <Tooltip title={column.label}>
                  <Typography
                    component="span"
                    sx={{
                      display: 'inline-block',
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      maxHeight: HEADER_HEIGHT - 16,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: SECTOR_RISK_PRESENCE_INK,
                    }}
                  >
                    {column.label}
                  </Typography>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={row.id} sx={{ height: ROW_HEIGHT }}>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  width: NAME_COL_WIDTH,
                  minWidth: NAME_COL_WIDTH,
                  maxWidth: NAME_COL_WIDTH,
                  height: ROW_HEIGHT,
                  px: 1.5,
                  bgcolor: SECTOR_RISK_PRESENCE_BAND,
                  color: SECTOR_RISK_PRESENCE_INK,
                  borderRight: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                  borderBottom: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                  borderLeft: row.accent ? `3px solid ${row.accent}` : undefined,
                }}
              >
                <Tooltip title={row.label}>
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 13,
                    }}
                  >
                    {row.label}
                  </Box>
                </Tooltip>
              </TableCell>
              {columns.map((column, columnIndex) => (
                <TableCell
                  key={column.id}
                  align="center"
                  sx={{
                    width: MARK_COL_WIDTH,
                    minWidth: MARK_COL_WIDTH,
                    height: ROW_HEIGHT,
                    p: 0,
                    bgcolor: SECTOR_RISK_PRESENCE_SURFACE,
                    color: SECTOR_RISK_PRESENCE_INK,
                    borderLeft: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                    borderBottom: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  {cells[rowIndex]?.[columnIndex] ? SECTOR_RISK_PRESENCE_MARK : ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
