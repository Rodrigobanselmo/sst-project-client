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
  RiskPrioritizationBrowseResult,
  RiskPrioritizationCell,
  RiskPrioritizationUnitKind,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';

import {
  buildPrioritizationCellTooltip,
  cellKey,
  contrastTextColor,
  indexPrioritizationCells,
  normalizeCssColor,
} from './risk-prioritization.util';

const KIND_COL_WIDTH = 30;
const NAME_COL_WIDTH = 280;
const RISK_COL_WIDTH = 40;
const ROW_HEIGHT = 34;
const GROUP_HEADER_HEIGHT = 28;
const RISK_HEADER_HEIGHT = 140;
const CELL_INSET = 2;
const CHIP_RADIUS = 5;
const CHIP_HEIGHT = ROW_HEIGHT - CELL_INSET * 2;
const QUANTITY_HATCH =
  'repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 4px, transparent 4px 8px)';
const PRIORITIZED_INSET_RING =
  'inset 0 0 0 1px rgba(255,255,255,0.88), inset 0 0 0 2px rgba(20,20,20,0.72)';

/** Canonical system type order (RiskOrderEnum), Outros last. */
const TYPE_ORDER = ['FIS', 'QUI', 'BIO', 'ERG', 'ACI', 'OUTROS'] as const;

const TYPE_GROUP_LABEL: Record<(typeof TYPE_ORDER)[number], string> = {
  FIS: 'Físicos',
  QUI: 'Químicos',
  BIO: 'Biológicos',
  ERG: 'Ergonômicos',
  ACI: 'Acidentes',
  OUTROS: 'Outros',
};

/** Theme tokens from `palette.risk` / SRiskChip — do not duplicate hex here. */
const TYPE_ACCENT: Record<(typeof TYPE_ORDER)[number], string> = {
  FIS: 'risk.fis',
  QUI: 'risk.qui',
  BIO: 'risk.bio',
  ERG: 'risk.erg',
  ACI: 'risk.aci',
  OUTROS: 'risk.outros',
};

function typeAccent(typeCode: string | null): string | undefined {
  if (!typeCode) return undefined;
  return TYPE_ACCENT[typeCode as keyof typeof TYPE_ACCENT];
}

type Column = RiskPrioritizationBrowseResult['columns'][number];
type Row = RiskPrioritizationBrowseResult['rows'][number];

function typeOrderIndex(typeCode: string | null): number {
  if (!typeCode) return TYPE_ORDER.length + 1;
  const index = TYPE_ORDER.indexOf(typeCode as (typeof TYPE_ORDER)[number]);
  return index === -1 ? TYPE_ORDER.length : index;
}

function sortColumnsByType(columns: Column[]): Column[] {
  return [...columns].sort((a, b) => {
    const type = typeOrderIndex(a.typeCode) - typeOrderIndex(b.typeCode);
    if (type !== 0) return type;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

function groupColumnsByType(columns: Column[]): Array<{
  typeCode: string | null;
  label: string;
  columns: Column[];
}> {
  const groups: Array<{
    typeCode: string | null;
    label: string;
    columns: Column[];
  }> = [];

  for (const column of columns) {
    const last = groups[groups.length - 1];
    if (last && last.typeCode === column.typeCode) {
      last.columns.push(column);
      continue;
    }
    const known =
      column.typeCode &&
      TYPE_GROUP_LABEL[column.typeCode as keyof typeof TYPE_GROUP_LABEL];
    groups.push({
      typeCode: column.typeCode,
      label: known || (column.typeCode ? column.typeCode : '—'),
      columns: [column],
    });
  }
  return groups;
}

function kindBlockLabel(kind: RiskPrioritizationUnitKind): string {
  return kind === 'REAL_GSE' ? 'GSE' : 'Elemento Caracterizado';
}

function splitRowBlocks(rows: Row[]): Array<{
  kind: RiskPrioritizationUnitKind;
  rows: Row[];
}> {
  const blocks: Array<{ kind: RiskPrioritizationUnitKind; rows: Row[] }> = [];
  for (const row of rows) {
    const last = blocks[blocks.length - 1];
    if (last && last.kind === row.kind) {
      last.rows.push(row);
      continue;
    }
    blocks.push({ kind: row.kind, rows: [row] });
  }
  return blocks;
}

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
  onCellClick,
}: {
  data: RiskPrioritizationBrowseResult;
  onCellClick: (cell: RiskPrioritizationCell) => void;
}) {
  const byKey = indexPrioritizationCells(data.cells);
  const columns = useMemo(
    () => sortColumnsByType(data.columns),
    [data.columns],
  );
  const typeGroups = useMemo(() => groupColumnsByType(columns), [columns]);
  const groupStartRiskIds = useMemo(
    () =>
      new Set(
        typeGroups
          .map((group) => group.columns[0]?.riskId)
          .filter((id): id is string => Boolean(id)),
      ),
    [typeGroups],
  );
  const rowBlocks = useMemo(() => splitRowBlocks(data.rows), [data.rows]);
  const tableWidth =
    KIND_COL_WIDTH + NAME_COL_WIDTH + columns.length * RISK_COL_WIDTH;
  const headerStackHeight = GROUP_HEADER_HEIGHT + RISK_HEADER_HEIGHT;

  const firstRowIds = new Set(
    rowBlocks.map((block) => block.rows[0]?.id).filter(Boolean) as string[],
  );
  const rowspanByFirstRowId = new Map(
    rowBlocks.map((block) => [block.rows[0]!.id, block.rows.length] as const),
  );
  const lastRowId = data.rows[data.rows.length - 1]?.id;
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
            <col key={column.riskId} style={{ width: RISK_COL_WIDTH }} />
          ))}
        </colgroup>
        <TableHead>
          <TableRow sx={{ height: GROUP_HEADER_HEIGHT }}>
            <TableCell rowSpan={2} sx={{ ...stickyKindHeaderSx, height: headerStackHeight }} />
            <TableCell
              rowSpan={2}
              sx={{ ...stickyNameHeaderSx, height: headerStackHeight }}
            >
              GSE / Elemento
            </TableCell>
            {typeGroups.map((group) => {
              const compact = group.columns.length * RISK_COL_WIDTH < 72;
              const code = group.typeCode || '—';
              const accent = typeAccent(group.typeCode);
              return (
                <TableCell
                  key={`${group.typeCode || 'none'}-${group.columns[0]?.riskId}`}
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
                  <Tooltip title={`${group.label}${group.typeCode ? ` (${group.typeCode})` : ''}`}>
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
                key={column.riskId}
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
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  borderLeft: '1px solid',
                  borderLeftColor: groupStartRiskIds.has(column.riskId)
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
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    pb: '2px',
                    pointerEvents: 'none',
                  }}
                >
                  <Tooltip title={column.name} placement="top">
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        lineClamp: '2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        overflowWrap: 'break-word',
                        wordBreak: 'normal',
                        pointerEvents: 'auto',
                        flex: '0 0 auto',
                        height: 'auto',
                        maxHeight: '100%',
                        maxWidth: RISK_COL_WIDTH - 8,
                        textAlign: 'start',
                        lineHeight: 1.2,
                        fontSize: 11,
                        color: 'text.primary',
                      }}
                    >
                      {column.name}
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.rows.map((row) => (
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
                    {kindBlockLabel(row.kind)}
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
                const cell = byKey.get(cellKey(row.id, column.riskId));
                const isGroupStart = groupStartRiskIds.has(column.riskId);
                const isLastRow = row.id === lastRowId;
                if (!cell) {
                  return (
                    <TableCell
                      key={column.riskId}
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
                    key={column.riskId}
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
                            {column.name}
                          </Box>
                          <Box sx={{ mt: 0.75, whiteSpace: 'pre-line' }}>
                            {buildPrioritizationCellTooltip({
                              riskName: column.name,
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
