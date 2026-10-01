import { useMemo, useState } from 'react';

import {
  Box,
  Popover,
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
  SectorRiskPresence,
  SectorRiskPresenceOrigin,
} from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';

import {
  findSectorRiskPresence,
  originsForSectorRiskPresence,
  presentSectorRiskPresence,
  sectorRiskPresenceCellRef,
  sectorRiskPresenceTooltip,
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
  onOpenOrigin,
}: {
  data: SectorRiskPresence;
  orientation: SectorRiskPresenceOrientation;
  onOpenOrigin: (params: {
    origin: SectorRiskPresenceOrigin;
    riskId: string;
    riskLabel: string;
  }) => void;
}) {
  const presentation = useMemo(
    () => presentSectorRiskPresence(data, orientation),
    [data, orientation],
  );
  const { rows, columns, cells } = presentation;
  const risksById = useMemo(
    () => new Map(data.risks.map((risk) => [risk.id, risk])),
    [data.risks],
  );
  const sectorsById = useMemo(
    () => new Map(data.sectors.map((sector) => [sector.id, sector])),
    [data.sectors],
  );
  const [selected, setSelected] = useState<{
    anchor: HTMLElement;
    riskId: string;
    sectorId: string;
  } | null>(null);

  const selectedRiskLabel = selected
    ? risksById.get(selected.riskId)?.label || ''
    : '';
  const selectedSectorName = selected
    ? sectorsById.get(selected.sectorId)?.name || ''
    : '';
  const selectedOrigins = selected
    ? originsForSectorRiskPresence(data, selected.riskId, selected.sectorId)
    : [];

  return (
    <>
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
                {columns.map((column, columnIndex) => {
                  const pair = sectorRiskPresenceCellRef(orientation, row.id, column.id);
                  const presence = findSectorRiskPresence(data, pair.riskId, pair.sectorId);
                  const present = Boolean(cells[rowIndex]?.[columnIndex] && presence);
                  if (!present || !presence) {
                    return (
                      <TableCell
                        key={column.id}
                        align="center"
                        sx={{
                          width: MARK_COL_WIDTH,
                          minWidth: MARK_COL_WIDTH,
                          height: ROW_HEIGHT,
                          p: 0,
                          bgcolor: SECTOR_RISK_PRESENCE_SURFACE,
                          borderLeft: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                          borderBottom: `1px solid ${SECTOR_RISK_PRESENCE_GRID}`,
                        }}
                      />
                    );
                  }

                  const riskLabel = risksById.get(pair.riskId)?.label || '';
                  const sectorName = sectorsById.get(pair.sectorId)?.name || '';
                  const tooltip = sectorRiskPresenceTooltip({
                    riskLabel,
                    sectorName,
                    originCount: presence.originIds.length,
                  });

                  return (
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
                      <Tooltip
                        title={tooltip}
                        componentsProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}
                      >
                        <Box
                          component="button"
                          type="button"
                          aria-label={tooltip}
                          onClick={(event) =>
                            setSelected({
                              anchor: event.currentTarget,
                              riskId: pair.riskId,
                              sectorId: pair.sectorId,
                            })
                          }
                          sx={{
                            appearance: 'none',
                            border: 0,
                            m: 0,
                            p: 0,
                            width: '100%',
                            height: ROW_HEIGHT,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            background: 'transparent',
                            color: 'inherit',
                            font: 'inherit',
                            fontSize: 16,
                            lineHeight: 1,
                            '&:hover': { bgcolor: SECTOR_RISK_PRESENCE_BAND },
                          }}
                        >
                          {SECTOR_RISK_PRESENCE_MARK}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Popover
        open={Boolean(selected)}
        anchorEl={selected?.anchor}
        onClose={() => setSelected(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ p: 1.5, maxWidth: 360 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: SECTOR_RISK_PRESENCE_INK }}>
            {selectedRiskLabel}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
            Setor: {selectedSectorName}
          </Typography>
          <Typography
            sx={{ fontSize: 12, fontWeight: 700, mt: 1.5, mb: 0.75, color: SECTOR_RISK_PRESENCE_INK }}
          >
            Origens da presença
          </Typography>
          {selectedOrigins.map((origin) => (
            <Box
              key={origin.id}
              component="button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                const riskId = selected?.riskId || '';
                const riskLabel = selectedRiskLabel;
                onOpenOrigin({ origin, riskId, riskLabel });
                window.setTimeout(() => setSelected(null), 0);
              }}
              sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                borderRadius: '4px',
                backgroundColor: 'background.paper',
                px: 1,
                py: 0.5,
                mb: 0.5,
                border: '1px solid',
                borderColor: 'grey.400',
                cursor: 'pointer',
                fontSize: 11,
                lineHeight: 1.4,
                color: SECTOR_RISK_PRESENCE_INK,
                whiteSpace: 'pre-line',
                fontFamily: 'inherit',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {origin.label}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
