import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useState } from 'react';

import {
  RiskInventoryColumnKey,
  RiskInventoryColumnsPreference,
  RiskInventoryPresentation,
  RiskInventoryRow,
  RiskInventoryUnit,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  formatInventoryEpis,
  formatInventoryLines,
  inventoryColumnVisible,
  inventoryDefaultColumnLabel,
  inventoryExposedEmployeeText,
  inventoryHeaderGroups,
  inventoryPresentationColor,
  inventoryPresentationText,
  inventoryProbabilityHint,
  inventoryProbabilityText,
  inventoryResidualProbabilityText,
  inventoryVerticalHeaderBoxPx,
  inventoryScreenColumnHeaderLabel,
  inventoryScreenColumnHeaderOrientation,
  inventoryScreenColumnLayout,
  inventoryTableMinWidth,
  inventoryWidthPercent,
  inventoryScreenColumnOrientation,
  inventoryUnitScopeText,
  inventoryVerticalRiskText,
  INVENTORY_VERTICAL_LINE_PX,
  INVENTORY_VERTICAL_ROTATION,
  INVENTORY_EMPTY,
  INVENTORY_EXPOSED_LABEL,
  INVENTORY_SCOPE_LABEL,
} from './risk-inventory.presentation';

const columns = [
  { id: 'type', key: 'TYPE', label: inventoryDefaultColumnLabel('TYPE') },
  { id: 'origin', key: 'ORIGIN', label: inventoryDefaultColumnLabel('ORIGIN') },
  { id: 'hazard', key: 'HAZARD', label: inventoryDefaultColumnLabel('HAZARD') },
  { id: 'damage', key: 'DAMAGE', label: inventoryDefaultColumnLabel('DAMAGE') },
  { id: 'source', key: 'GENERATING_SOURCE', label: inventoryDefaultColumnLabel('GENERATING_SOURCE') },
  { id: 'epi', key: 'EPI', label: inventoryDefaultColumnLabel('EPI') },
  { id: 'epc', key: 'ENGINEERING', label: inventoryDefaultColumnLabel('ENGINEERING') },
  { id: 'adm', key: 'ADMINISTRATIVE', label: inventoryDefaultColumnLabel('ADMINISTRATIVE') },
  { id: 'severity', key: 'SEVERITY', label: inventoryDefaultColumnLabel('SEVERITY') },
  { id: 'probability', key: 'PROBABILITY', label: inventoryDefaultColumnLabel('PROBABILITY') },
  { id: 'real', key: 'REAL_RISK', label: inventoryDefaultColumnLabel('REAL_RISK') },
  { id: 'recs', key: 'RECOMMENDATIONS', label: inventoryDefaultColumnLabel('RECOMMENDATIONS') },
  { id: 'pAfter', key: 'PROBABILITY_RESIDUAL', label: inventoryDefaultColumnLabel('PROBABILITY_RESIDUAL') },
  { id: 'residual', key: 'RESIDUAL_RISK', label: inventoryDefaultColumnLabel('RESIDUAL_RISK') },
] as const;

type InventoryColumnId = (typeof columns)[number]['id'];

const RESIDUAL_COLUMN_IDS = new Set<InventoryColumnId>(['recs', 'pAfter', 'residual']);

function columnsFor(preference: RiskInventoryColumnsPreference | null) {
  return columns.filter((column) => inventoryColumnVisible(preference, column.key as RiskInventoryColumnKey));
}

const cellSx = {
  verticalAlign: 'top',
  whiteSpace: 'pre-line',
  fontSize: 13,
  lineHeight: 1.35,
  py: 1,
};

const INVENTORY_GROUP_HEADER_PX = 32;

function columnLayout(preference: RiskInventoryColumnsPreference | null, columnId: InventoryColumnId) {
  return inventoryScreenColumnLayout(preference, columnId);
}

const residualDividerSx = {
  borderLeft: '2px solid',
  borderLeftColor: 'text.primary',
};

function textOn(color: string): string {
  const hex = color.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return '#1a1a1a';
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? '#1a1a1a' : '#ffffff';
}

function textOrEmpty(value: string | number | null | undefined): string {
  if (value == null) return INVENTORY_EMPTY;
  const text = String(value).trim();
  return text || INVENTORY_EMPTY;
}

function VerticalText({
  text,
  title,
  tone,
  linePx = INVENTORY_VERTICAL_LINE_PX,
  stackPx,
  align = 'center',
  contentAlignY = 'bottom',
}: {
  text: string;
  title?: string;
  tone?: { bgcolor: string; color: string };
  linePx?: number;
  stackPx: number;
  align?: 'left' | 'center';
  contentAlignY?: 'bottom' | 'top';
}) {
  return (
    <Box
      component="span"
      title={title ?? text}
      sx={{
        position: 'relative',
        display: 'inline-block',
        height: linePx,
        width: stackPx,
        maxHeight: linePx,
        maxWidth: stackPx,
        overflow: 'hidden',
        verticalAlign: contentAlignY === 'top' ? 'top' : 'middle',
        textAlign: align,
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: linePx,
          height: stackPx,
          boxSizing: 'border-box',
          transform: `translate(-50%, -50%) ${INVENTORY_VERTICAL_ROTATION}`,
          transformOrigin: 'center center',
          overflow: 'hidden',
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          lineHeight: 1.25,
          display: contentAlignY === 'top' ? 'flex' : 'block',
          alignItems:
            contentAlignY === 'top' ? (align === 'left' ? 'flex-start' : 'center') : undefined,
          justifyContent: contentAlignY === 'top' ? 'flex-end' : undefined,
          // After rotate(-90deg) the cross axis is the column width. flex-start is the same
          // edge the block header uses, so it lands on the left. center keeps the RO badge
          // in the middle. flex-end on the long axis still maps to the top of the row.
          textAlign: 'left',
        }}
      >
        {tone ? (
          <Box
            component="span"
            sx={{
              bgcolor: tone.bgcolor,
              color: tone.color,
              fontWeight: 600,
              fontSize: 13,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            {text}
          </Box>
        ) : (
          text
        )}
      </Box>
    </Box>
  );
}

function RiskPill({
  presentation,
  compact = false,
  stackPx,
  align = 'center',
  contentAlignY = 'bottom',
}: {
  presentation: RiskInventoryPresentation | null;
  compact?: boolean;
  stackPx: number;
  align?: 'left' | 'center';
  contentAlignY?: 'bottom' | 'top';
}) {
  const fullLabel = inventoryPresentationText(presentation);
  const label = compact ? inventoryVerticalRiskText(presentation) : fullLabel;
  const color = inventoryPresentationColor(presentation);
  if (label === INVENTORY_EMPTY) {
    return <Typography sx={{ fontSize: 13 }}>{INVENTORY_EMPTY}</Typography>;
  }

  if (compact) {
    const bgcolor = color ? (color.startsWith('#') ? color : `#${color}`) : 'grey.100';
    return (
      <VerticalText
        text={label}
        title={label}
        stackPx={stackPx}
        align={align}
        contentAlignY={contentAlignY}
        tone={{ bgcolor, color: color ? textOn(color) : 'text.primary' }}
      />
    );
  }

  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 'auto',
        maxWidth: '100%',
        '& .MuiChip-label': {
          whiteSpace: 'normal',
          py: 0.5,
        },
        bgcolor: color ? (color.startsWith('#') ? color : `#${color}`) : 'grey.100',
        color: color ? textOn(color) : 'text.primary',
        fontWeight: 600,
      }}
    />
  );
}

function InventoryRow({
  row,
  columns: visibleColumns,
  columnPreference,
}: {
  row: RiskInventoryRow;
  columns: ReadonlyArray<{ id: InventoryColumnId; dividerBefore?: boolean }>;
  columnPreference: RiskInventoryColumnsPreference | null;
}) {
  const probabilityHint = inventoryProbabilityHint(row);
  const vertical = (columnId: InventoryColumnId) =>
    inventoryScreenColumnOrientation(columnPreference, columnId) === 'VERTICAL';
  const layout = (columnId: InventoryColumnId) =>
    columnLayout(columnPreference, columnId);
  const pad = (columnId: InventoryColumnId) => (layout(columnId).role === 'text' ? {} : { px: 0.5 });
  const renderText = (
    columnId: InventoryColumnId,
    text: string,
    extraTitle?: string | null,
  ) => {
    if (!vertical(columnId)) return text;
    const title = [text, extraTitle].filter(Boolean).join('\n');
    return (
      <VerticalText
        text={text}
        title={title}
        stackPx={layout(columnId).stackPx}
        align={columnId === 'type' ? 'left' : layout(columnId).align}
        contentAlignY={columnId === 'type' ? 'top' : 'bottom'}
      />
    );
  };
  const content = (columnId: InventoryColumnId) => {
    if (columnId === 'type') return renderText('type', textOrEmpty(row.riskTypeLabel || row.riskType));
    if (columnId === 'origin') return renderText('origin', textOrEmpty(row.originText));
    if (columnId === 'hazard') return renderText('hazard', textOrEmpty(row.hazardName));
    if (columnId === 'damage') return renderText('damage', textOrEmpty(row.damage));
    if (columnId === 'source') return renderText('source', formatInventoryLines(row.generatingSources));
    if (columnId === 'epi') return renderText('epi', formatInventoryEpis(row.epis));
    if (columnId === 'epc') return renderText('epc', formatInventoryLines(row.engineeringMeasures));
    if (columnId === 'adm') return renderText('adm', formatInventoryLines(row.administrativeMeasures));
    if (columnId === 'severity') return renderText('severity', textOrEmpty(row.severity));
    if (columnId === 'probability') return renderText('probability', inventoryProbabilityText(row), probabilityHint);
    if (columnId === 'real') {
      return (
        <RiskPill
          presentation={row.realRisk}
          compact={vertical('real')}
          stackPx={layout('real').stackPx}
          align={layout('real').align}
          contentAlignY="top"
        />
      );
    }
    if (columnId === 'recs') return renderText('recs', formatInventoryLines(row.recommendations));
    if (columnId === 'pAfter') return renderText('pAfter', inventoryResidualProbabilityText(row));
    return (
      <RiskPill
        presentation={row.residual.presentation}
        compact={vertical('residual')}
        stackPx={layout('residual').stackPx}
        align={layout('residual').align}
        contentAlignY="top"
      />
    );
  };

  return (
    <TableRow>
      {visibleColumns.map((column) => (
        <TableCell
          key={column.id}
          align={column.id === 'type' ? 'left' : layout(column.id).align}
          sx={{
            ...cellSx,
            ...pad(column.id),
            ...(column.id === 'hazard' ? { fontWeight: 600 } : {}),
            ...(column.id === 'severity' || column.id === 'probability' || column.id === 'pAfter'
              ? { fontWeight: 700 }
              : {}),
            ...(column.id === 'real' || column.id === 'residual'
              ? { ...(vertical(column.id) ? { verticalAlign: 'top' } : {}) }
              : {}),
            ...(column.dividerBefore ? residualDividerSx : {}),
          }}
        >
          {content(column.id)}
        </TableCell>
      ))}
    </TableRow>
  );
}

function UnitHeader({
  unit,
  expanded,
  onToggle,
}: {
  unit: RiskInventoryUnit;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      sx={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1.25,
        bgcolor: 'grey.50',
        border: 0,
        borderBottom: expanded ? '1px solid' : 'none',
        borderColor: 'divider',
        borderRadius: 0,
        cursor: 'pointer',
        textAlign: 'left',
        color: 'inherit',
        font: 'inherit',
      }}
    >
      <ExpandMoreIcon
        sx={{
          fontSize: '1.4rem',
          color: 'text.secondary',
          flexShrink: 0,
          transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          transition: 'transform 0.15s ease',
        }}
      />
      <Typography component="span" variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {unit.name}
      </Typography>
    </Box>
  );
}

function UnitDetails({ unit }: { unit: RiskInventoryUnit }) {
  const scope = inventoryUnitScopeText(unit.scope);

  return (
    <Box sx={{ px: 1.5, pt: 1, pb: 1.25 }}>
      {unit.description ? (
        <Typography variant="body2">
          {unit.description}
        </Typography>
      ) : null}
      {scope ? (
        <Typography variant="body2" sx={{ mt: unit.description ? 0.75 : 0 }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            {INVENTORY_SCOPE_LABEL}{' '}
          </Box>
          {scope}
        </Typography>
      ) : null}
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        <Box component="span" sx={{ fontWeight: 700 }}>
          {INVENTORY_EXPOSED_LABEL}{' '}
        </Box>
        {inventoryExposedEmployeeText(unit.exposedEmployeeCount)}
      </Typography>
    </Box>
  );
}

export function RiskInventoryTable({
  units,
  columnPreference = null,
}: {
  units: RiskInventoryUnit[];
  columnPreference?: RiskInventoryColumnsPreference | null;
}) {
  const visibleColumns = columnsFor(columnPreference);
  const firstResidualId = visibleColumns.find((column) => RESIDUAL_COLUMN_IDS.has(column.id))?.id;
  const headerGroups = inventoryHeaderGroups(visibleColumns.map((column) => column.id));
  const headerVertical = (columnId: InventoryColumnId) =>
    inventoryScreenColumnHeaderOrientation(columnPreference, columnId) === 'VERTICAL';
  const headerLabel = (columnId: InventoryColumnId, fallback: string) =>
    inventoryScreenColumnHeaderLabel(columnPreference, columnId, fallback);
  const layouts = visibleColumns.map((column) => ({
    ...column,
    dividerBefore: column.id === firstResidualId,
    layout: columnLayout(columnPreference, column.id),
  }));
  const totalWeight = layouts.reduce((sum, column) => sum + column.layout.weight, 0);
  const tableMinWidth = inventoryTableMinWidth(layouts.map((column) => column.layout.weight));
  const [expandedUnitIds, setExpandedUnitIds] = useState<ReadonlySet<string>>(() => new Set());
  const toggleUnit = (unitId: string) => {
    setExpandedUnitIds((current) => {
      const next = new Set(current);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {units.map((unit) => {
        const expanded = expandedUnitIds.has(unit.id);
        return (
        <Box
          key={unit.id}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <UnitHeader unit={unit} expanded={expanded} onToggle={() => toggleUnit(unit.id)} />
          {expanded ? (
          <>
          <UnitDetails unit={unit} />
          {unit.rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 2 }}>
              Nenhum fator de risco neste grupo.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
              <Table
                stickyHeader
                size="small"
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                  minWidth: tableMinWidth,
                }}
              >
                <colgroup>
                  {layouts.map((column) => (
                    <col
                      key={column.id}
                      style={{ width: `${inventoryWidthPercent(column.layout.weight, totalWeight)}%` }}
                    />
                  ))}
                </colgroup>
                <TableHead>
                  <TableRow>
                    {headerGroups.map((group) => (
                      <TableCell
                        key={group.id}
                        colSpan={group.colSpan}
                        align={group.id === 'occupation' ? 'left' : 'center'}
                        sx={{
                          top: 0,
                          zIndex: 4,
                          height: INVENTORY_GROUP_HEADER_PX,
                          py: 0,
                          boxSizing: 'border-box',
                          fontWeight: 700,
                          fontSize: 11,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          bgcolor: 'grey.50',
                          ...(group.id === 'residual' ? residualDividerSx : {}),
                        }}
                      >
                        {group.label}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {layouts.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.id === 'type' ? 'left' : column.layout.align}
                        sx={{
                          top: INVENTORY_GROUP_HEADER_PX,
                          zIndex: 3,
                          verticalAlign: 'middle',
                          ...(column.layout.role === 'text' ? {} : { px: 0.5 }),
                          fontWeight: 700,
                          fontSize: 12,
                          ...(headerVertical(column.id) ? {} : { lineHeight: 1.15 }),
                          bgcolor: 'background.paper',
                          ...(headerVertical(column.id) || column.layout.role === 'text'
                            ? {}
                            : { whiteSpace: 'nowrap' }),
                          ...(column.dividerBefore ? residualDividerSx : {}),
                        }}
                      >
                        {headerVertical(column.id) ? (
                          <VerticalText
                            text={headerLabel(column.id, column.label)}
                            linePx={inventoryVerticalHeaderBoxPx(headerLabel(column.id, column.label))}
                            stackPx={column.layout.stackPx}
                            align={column.id === 'type' ? 'left' : column.layout.align}
                          />
                        ) : (
                          headerLabel(column.id, column.label)
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unit.rows.map((row) => (
                    <InventoryRow
                      key={`${unit.id}-${row.riskFactorId}-${row.originHomogeneousGroupIds.join(',')}`}
                      row={row}
                      columns={layouts}
                      columnPreference={columnPreference}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          </>
          ) : null}
        </Box>
        );
      })}
    </Box>
  );
}
