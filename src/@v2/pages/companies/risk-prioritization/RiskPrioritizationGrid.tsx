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

import {
  PrioritizationMatrixOrientation,
  RiskPrioritizationBrowseResult,
  RiskPrioritizationCell,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';

import { presentPrioritizationMatrix } from './risk-prioritization.presentation';
import {
  buildPrioritizationCellTooltip,
  contrastTextColor,
  normalizeCssColor,
} from './risk-prioritization.util';

const KIND_COL_WIDTH = 30;
const NAME_COL_WIDTH = 280;
const RISK_COL_WIDTH = 40;
const ROW_HEIGHT = 34;
const GROUP_HEADER_HEIGHT = 28;
const RISK_HEADER_HEIGHT = 140;
const RISK_HEADER_LABEL_FONT_SIZE = 11;
const RISK_HEADER_LABEL_LINE_HEIGHT = 1.2;
/** Horizontal width before rotation. Becomes the vertical run of the name. */
const RISK_HEADER_LABEL_WIDTH = RISK_HEADER_HEIGHT - 3;
/** At most two horizontal lines before rotation. Becomes the column thickness. */
const RISK_HEADER_LABEL_MAX_HEIGHT =
  RISK_HEADER_LABEL_FONT_SIZE * RISK_HEADER_LABEL_LINE_HEIGHT * 2;
const CELL_INSET = 2;
const CHIP_RADIUS = 5;
const CHIP_HEIGHT = ROW_HEIGHT - CELL_INSET * 2;
const QUANTITY_HATCH =
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 4px, transparent 4px 8px)';
const PRIORITIZED_INSET_RING =
  'inset 0 0 0 1px rgba(255,255,255,0.88), inset 0 0 0 2px rgba(20,20,20,0.72)';

export function omitRepresentAllPrioritizationRisks(
  data: RiskPrioritizationBrowseResult,
  representAllRiskIds: Set<string>,
): RiskPrioritizationBrowseResult {
  if (!representAllRiskIds.size) return data;
  const columns = data.columns.filter(
    (column) => !representAllRiskIds.has(column.riskId),
  );
  if (columns.length === data.columns.length) return data;
  const cells = data.cells.filter(
    (cell) => !representAllRiskIds.has(cell.riskId),
  );
  const legendKeys = new Set(
    cells.map(
      (cell) => `${cell.matrixSource}:${cell.abbreviation}:${cell.label}`,
    ),
  );
  const legend = data.legend.filter((entry) =>
    legendKeys.has(`${entry.matrixSource}:${entry.abbreviation}:${entry.label}`),
  );
  return {
    ...data,
    columns,
    cells,
    legend,
    meta: {
      ...data.meta,
      riskCount: columns.length,
      cellCount: cells.length,
    },
  };
}

const stickyKindHeaderSx = {
  position: 'sticky',
  left: 0,
  top: 0,
  zIndex: 5,
  width: KIND_COL_WIDTH,
  minWidth: KIND_COL_WIDTH,
  maxWidth: KIND_COL_WIDTH,
  bgcolor: 'background.paper',
  borderRight: '1px solid',
  borderBottom: '1px solid',
  borderRightColor: 'grey.200',
  borderBottomColor: 'grey.400',
  p: 0,
} as const;

const stickyNameHeaderSx = {
  position: 'sticky',
  left: KIND_COL_WIDTH,
  top: 0,
  zIndex: 5,
  width: NAME_COL_WIDTH,
  minWidth: NAME_COL_WIDTH,
  maxWidth: NAME_COL_WIDTH,
  bgcolor: 'background.paper',
  borderRight: '1px solid',
  borderBottom: '1px solid',
  borderRightColor: 'grey.200',
  borderBottomColor: 'grey.400',
  fontWeight: 700,
} as const;

const stickyKindBodySx = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  width: KIND_COL_WIDTH,
  minWidth: KIND_COL_WIDTH,
  maxWidth: KIND_COL_WIDTH,
  bgcolor: 'grey.100',
  borderRight: '1px solid',
  borderColor: 'grey.200',
  p: 0,
  textAlign: 'center',
  verticalAlign: 'middle',
  '.MuiTableRow-hover:hover &': {
    bgcolor: 'grey.100',
  },
} as const;

const stickyNameBodySx = {
  position: 'sticky',
  left: KIND_COL_WIDTH,
  zIndex: 2,
  width: NAME_COL_WIDTH,
  minWidth: NAME_COL_WIDTH,
  maxWidth: NAME_COL_WIDTH,
  height: ROW_HEIGHT,
  py: 0.25,
  px: 1,
  bgcolor: 'background.paper',
  borderRight: '1px solid',
  borderColor: 'grey.200',
  '.MuiTableRow-hover:hover &': {
    bgcolor: 'background.paper',
  },
} as const;

const riskColSx = {
  width: RISK_COL_WIDTH,
  minWidth: RISK_COL_WIDTH,
  maxWidth: RISK_COL_WIDTH,
  height: ROW_HEIGHT,
  p: `${CELL_INSET}px`,
  bgcolor: 'grey.50',
  boxSizing: 'border-box',
  borderBottom: '1px solid',
  borderBottomColor: 'grey.100',
} as const;

function riskColumnSx(isGroupStart: boolean) {
  return {
    ...riskColSx,
    borderLeft: '1px solid',
    borderLeftColor: isGroupStart ? 'grey.400' : 'grey.100',
  };
}

export function RiskPrioritizationGrid({
  data,
  orientation = 'UNITS_IN_ROWS',
  onCellClick,
}: {
  data: RiskPrioritizationBrowseResult;
  orientation?: PrioritizationMatrixOrientation;
  onCellClick: (cell: RiskPrioritizationCell) => void;
}) {
  const presentation = useMemo(
    () => presentPrioritizationMatrix(data, orientation),
    [data, orientation],
  );
  const { columns, columnGroups, rows } = presentation;
  const groupStartIds = useMemo(
    () =>
      new Set(
        columnGroups
          .map((group) => group.columns[0]?.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [columnGroups],
  );
  const rowBlocks = useMemo(() => {
    const blocks: Array<{ rows: typeof rows }> = [];
    for (const row of rows) {
      const last = blocks[blocks.length - 1];
      if (last && last.rows[0]?.groupKey === row.groupKey) {
        last.rows.push(row);
        continue;
      }
      blocks.push({ rows: [row] });
    }
    return blocks;
  }, [rows]);
  const tableWidth =
    KIND_COL_WIDTH + NAME_COL_WIDTH + columns.length * RISK_COL_WIDTH;
  const headerStackHeight = GROUP_HEADER_HEIGHT + RISK_HEADER_HEIGHT;

  const firstRowIds = new Set(
    rowBlocks.map((block) => block.rows[0]?.id).filter(Boolean) as string[],
  );
  const rowspanByFirstRowId = new Map(
    rowBlocks.map((block) => [block.rows[0]!.id, block.rows.length] as const),
  );
  const lastRowId = rows[rows.length - 1]?.id;
  const lastKindRowId = rowBlocks[rowBlocks.length - 1]?.rows[0]?.id;

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
      <Table
        stickyHeader
        size="small"
        sx={{
          tableLayout: 'fixed',
          width: tableWidth,
          minWidth: tableWidth,
          '& tbody .MuiTableCell-root': {
            borderBottomColor: 'grey.100',
          },
          '& tbody .MuiTableRow-root:last-of-type .MuiTableCell-root': {
            borderBottomColor: 'grey.400',
          },
        }}
      >
        <colgroup>
          <col style={{ width: KIND_COL_WIDTH }} />
          <col style={{ width: NAME_COL_WIDTH }} />
          {columns.map((column) => (
            <col key={column.id} style={{ width: RISK_COL_WIDTH }} />
          ))}
        </colgroup>
        <TableHead>
          <TableRow sx={{ height: GROUP_HEADER_HEIGHT }}>
            <TableCell rowSpan={2} sx={{ ...stickyKindHeaderSx, height: headerStackHeight }} />
            <TableCell
              rowSpan={2}
              sx={{ ...stickyNameHeaderSx, height: headerStackHeight }}
            >
              {presentation.cornerLabel}
            </TableCell>
            {columnGroups.map((group) => {
              const compact = group.columns.length * RISK_COL_WIDTH < 72;
              const code = group.code;
              const accent = group.accent;
              return (
                <TableCell
                  key={`${group.key}-${group.columns[0]?.id}`}
                  align="center"
                  colSpan={group.columns.length}
                  sx={{
                    top: 0,
                    zIndex: 3,
                    height: GROUP_HEADER_HEIGHT,
                    py: 0,
                    px: 0.25,
                    bgcolor: 'grey.50',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                    borderTop: accent ? '3px solid' : '1px solid',
                    borderTopColor: accent || 'grey.200',
                    borderBottom: '1px solid',
                    borderBottomColor: 'grey.200',
                    borderLeft: '1px solid',
                    borderLeftColor: 'grey.400',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    boxSizing: 'border-box',
                  }}
                >
                  <Tooltip
                    title={
                      group.code && group.code !== group.label && group.code !== '—'
                        ? `${group.label} (${group.code})`
                        : group.label
                    }
                  >
                    <Typography
                      component="span"
                      sx={{ fontSize: 10, fontWeight: 700, color: 'text.secondary' }}
                    >
                      {compact ? code : group.label}
                    </Typography>
                  </Tooltip>
                </TableCell>
              );
            })}
          </TableRow>
          <TableRow sx={{ height: RISK_HEADER_HEIGHT }}>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align="center"
                sx={{
                  width: RISK_COL_WIDTH,
                  minWidth: RISK_COL_WIDTH,
                  maxWidth: RISK_COL_WIDTH,
                  height: RISK_HEADER_HEIGHT,
                  p: 0.5,
                  top: GROUP_HEADER_HEIGHT,
                  zIndex: 2,
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  verticalAlign: 'bottom',
                  overflow: 'visible',
                  boxSizing: 'border-box',
                  borderLeft: '1px solid',
                  borderLeftColor: groupStartIds.has(column.id)
                    ? 'grey.400'
                    : 'grey.100',
                  borderBottom: '1px solid',
                  borderBottomColor: 'grey.400',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <Tooltip title={column.label} placement="top">
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        bottom: 2,
                        width: RISK_HEADER_LABEL_WIDTH,
                        maxHeight: RISK_HEADER_LABEL_MAX_HEIGHT,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        transformOrigin: 'center center',
                        transform: `translateX(-50%) translateY(calc(-${
                          RISK_HEADER_LABEL_WIDTH / 2
                        }px + 50%)) rotate(-90deg)`,
                        display: 'block',
                        whiteSpace: 'normal',
                        textAlign: 'left',
                        pointerEvents: 'auto',
                        lineHeight: RISK_HEADER_LABEL_LINE_HEIGHT,
                        fontSize: RISK_HEADER_LABEL_FONT_SIZE,
                        color: 'text.primary',
                      }}
                    >
                      {column.label}
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} hover sx={{ height: ROW_HEIGHT }}>
              {firstRowIds.has(row.id) ? (
                <TableCell
                  rowSpan={rowspanByFirstRowId.get(row.id)}
                  sx={{
                    ...stickyKindBodySx,
                    ...(row.id === lastKindRowId
                      ? {
                          borderBottom: '1px solid',
                          borderBottomColor: 'grey.400',
                        }
                      : {}),
                  }}
                >
                  <Typography
                    sx={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      display: 'inline-block',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      color: 'text.secondary',
                      lineHeight: 1.1,
                      maxHeight: (rowspanByFirstRowId.get(row.id) || 1) * ROW_HEIGHT - 8,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.groupLabel}
                  </Typography>
                </TableCell>
              ) : null}
              <TableCell
                sx={{
                  ...stickyNameBodySx,
                  ...(row.id === lastRowId
                    ? {
                        borderBottom: '1px solid',
                        borderBottomColor: 'grey.400',
                      }
                    : {}),
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  title={row.label}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.2,
                    fontSize: 12,
                  }}
                >
                  {row.label}
                </Typography>
              </TableCell>
              {columns.map((column) => {
                const cell = presentation.cell(row.id, column.id);
                const isGroupStart = groupStartIds.has(column.id);
                const isLastRow = row.id === lastRowId;
                if (!cell) {
                  return (
                    <TableCell
                      key={column.id}
                      align="center"
                      sx={{
                        ...riskColumnSx(isGroupStart),
                        ...(isLastRow
                          ? {
                              borderBottom: '1px solid',
                              borderBottomColor: 'grey.400',
                            }
                          : {}),
                      }}
                    />
                  );
                }

                const clickable = cell.origins.length > 0;
                const cellColor = normalizeCssColor(cell.color);
                const textColor = contrastTextColor(cellColor);
                return (
                  <TableCell
                    key={column.id}
                    align="center"
                    onClick={clickable ? () => onCellClick(cell) : undefined}
                    sx={{
                      ...riskColumnSx(isGroupStart),
                      cursor: clickable ? 'pointer' : 'default',
                      ...(isLastRow
                        ? {
                            borderBottom: '1px solid',
                            borderBottomColor: 'grey.400',
                          }
                        : {}),
                    }}
                  >
                    <Tooltip
                      title={
                        <Box>
                          <Box sx={{ lineHeight: 1.2, whiteSpace: 'normal' }}>
                            {presentation.riskName(row.id, column.id)}
                          </Box>
                          <Box sx={{ mt: 0.75, whiteSpace: 'pre-line' }}>
                            {buildPrioritizationCellTooltip({
                              riskName: presentation.riskName(row.id, column.id),
                              cell,
                            })
                              .split('\n')
                              .slice(1)
                              .join('\n')}
                          </Box>
                        </Box>
                      }
                    >
                      <Box
                        sx={{
                          height: CHIP_HEIGHT,
                          width: '100%',
                          borderRadius: `${CHIP_RADIUS}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: cellColor || 'grey.100',
                          color: textColor,
                          fontWeight: cell.isPrioritized ? 800 : 700,
                          boxShadow: cell.isPrioritized
                            ? PRIORITIZED_INSET_RING
                            : undefined,
                          backgroundImage: cell.isQuantity
                            ? QUANTITY_HATCH
                            : undefined,
                          boxSizing: 'border-box',
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontSize: cell.abbreviation.length > 3 ? 10 : 12,
                            fontWeight: 'inherit',
                            color: 'inherit',
                            letterSpacing: 0.2,
                            lineHeight: 1,
                          }}
                        >
                          {cell.abbreviation}
                        </Typography>
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
  );
}
