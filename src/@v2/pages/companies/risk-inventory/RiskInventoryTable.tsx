import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type ReactNode } from 'react';

import {
  RiskInventoryColumnsPreference,
  RiskInventoryExtraColumnSetting,
  RiskInventoryOptionalColumnSetting,
  RiskInventoryPresentation,
  RiskInventoryRow,
  RiskInventoryUnit,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  formatInventoryEpis,
  formatInventoryLines,
  inventoryDefaultColumnLabel,
  inventoryExposedEmployeeText,
  inventoryExtraColumnHeaderOrientation,
  inventoryExtraColumnLabel,
  inventoryExtraColumnOrientation,
  inventoryExtraColumnWidthWeight,
  inventoryOptionalColumnLabel,
  inventoryOptionalColumnOrientation,
  inventoryOptionalColumnHeaderOrientation,
  inventoryOptionalColumnWidthWeight,
  inventoryOptionalCriteriaText,
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
  inventoryColumnFamily,
  inventoryHeaderRuns,
  inventoryOrderColumnScreenOnly,
  inventoryOrderColumnVisible,
  inventoryScreenColumnOrientation,
  resolveInventoryColumnOrder,
  inventoryUnitScopeText,
  inventoryVerticalRiskText,
  inventoryVisibleExtraColumns,
  inventoryVisibleOptionalColumns,
  INVENTORY_SCREEN_ONLY_HINT,
  INVENTORY_VERTICAL_LINE_PX,
  INVENTORY_VERTICAL_ROTATION,
  INVENTORY_VERTICAL_STACK_PX,
  INVENTORY_EMPTY,
  INVENTORY_EXPOSED_LABEL,
  INVENTORY_SCOPE_LABEL,
} from './risk-inventory.presentation';

/** Screen-only (visible, not in Word): mute text, keep normal table background. */
const screenOnlySx = {
  color: 'text.disabled',
} as const;

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

type InventorySlot =
  | { kind: 'native'; id: InventoryColumnId; label: string; dividerBefore: boolean; weight: number; screenOnly: boolean }
  | { kind: 'extra'; extra: ExtraLayout; dividerBefore: boolean }
  | { kind: 'optional'; optional: OptionalLayout; dividerBefore: boolean };

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

type ExtraLayout = {
  key: RiskInventoryExtraColumnSetting['key'];
  label: string;
  weight: number;
  align: 'left' | 'center';
  vertical: boolean;
  headerVertical: boolean;
  stackPx: number;
  screenOnly: boolean;
};

type OptionalLayout = {
  key: RiskInventoryOptionalColumnSetting['key'];
  label: string;
  weight: number;
  align: 'left' | 'center';
  vertical: boolean;
  headerVertical: boolean;
  stackPx: number;
  screenOnly: boolean;
};

function extraLayoutsFor(preference: RiskInventoryColumnsPreference | null): ExtraLayout[] {
  return inventoryVisibleExtraColumns(preference).map((column) => ({
    key: column.key,
    label: inventoryExtraColumnLabel(column),
    weight: inventoryExtraColumnWidthWeight(column),
    align: column.key === 'symptoms' ? 'left' : 'center',
    vertical: inventoryExtraColumnOrientation(column) === 'VERTICAL',
    headerVertical: inventoryExtraColumnHeaderOrientation(column) === 'VERTICAL',
    stackPx: column.key === 'symptoms' || column.key === 'propagation' ? INVENTORY_VERTICAL_STACK_PX : 44,
    screenOnly: inventoryOrderColumnScreenOnly(preference, column.key),
  }));
}

function optionalLayoutsFor(preference: RiskInventoryColumnsPreference | null): OptionalLayout[] {
  return inventoryVisibleOptionalColumns(preference).map((column) => ({
    key: column.key,
    label: inventoryOptionalColumnLabel(column),
    weight: inventoryOptionalColumnWidthWeight(column),
    align: 'left' as const,
    vertical: inventoryOptionalColumnOrientation(column) === 'VERTICAL',
    headerVertical: inventoryOptionalColumnHeaderOrientation(column) === 'VERTICAL',
    stackPx: INVENTORY_VERTICAL_STACK_PX,
    screenOnly: inventoryOrderColumnScreenOnly(preference, column.key),
  }));
}

function InventoryRow({
  row,
  slots,
  columnPreference,
}: {
  row: RiskInventoryRow;
  slots: readonly InventorySlot[];
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
      {slots.map((slot) => {
        if (slot.kind === 'extra') {
          const column = slot.extra;
          const text = row.technicalValues?.[column.key]?.trim() || INVENTORY_EMPTY;
          return (
            <TableCell
              key={column.key}
              align={column.align}
              sx={{
                ...cellSx,
                ...(column.align === 'center' ? { px: 0.5 } : {}),
                ...(slot.dividerBefore ? residualDividerSx : {}),
                ...(column.screenOnly ? screenOnlySx : {}),
              }}
            >
              {column.vertical ? (
                <VerticalText text={text} title={text} stackPx={column.stackPx} align={column.align} />
              ) : (
                text
              )}
            </TableCell>
          );
        }
        if (slot.kind === 'optional') {
          const column = slot.optional;
          const text = inventoryOptionalCriteriaText(row, column.key);
          return (
            <TableCell
              key={column.key}
              align={column.align}
              sx={{
                ...cellSx,
                ...(slot.dividerBefore ? residualDividerSx : {}),
                ...(column.screenOnly ? screenOnlySx : {}),
              }}
            >
              {column.vertical ? (
                <VerticalText text={text} title={text} stackPx={column.stackPx} align={column.align} />
              ) : (
                text
              )}
            </TableCell>
          );
        }
        return (
          <TableCell
            key={slot.id}
            align={slot.id === 'type' ? 'left' : layout(slot.id).align}
            sx={{
              ...cellSx,
              ...pad(slot.id),
              ...(slot.id === 'hazard' ? { fontWeight: 600 } : {}),
              ...(slot.id === 'severity' || slot.id === 'probability' || slot.id === 'pAfter'
                ? { fontWeight: 700 }
                : {}),
              ...(slot.id === 'real' || slot.id === 'residual'
                ? { ...(vertical(slot.id) ? { verticalAlign: 'top' } : {}) }
                : {}),
              ...(slot.dividerBefore ? residualDividerSx : {}),
              ...(slot.screenOnly ? screenOnlySx : {}),
            }}
          >
            {content(slot.id)}
          </TableCell>
        );
      })}
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
  const nativeByKey = new Map(columns.map((column) => [column.key, column]));
  const extrasByKey = new Map(extraLayoutsFor(columnPreference).map((column) => [column.key, column]));
  const optionalsByKey = new Map(optionalLayoutsFor(columnPreference).map((column) => [column.key, column]));
  const logicalOrder = resolveInventoryColumnOrder(columnPreference);
  const visibleKeys = logicalOrder.filter((key) => inventoryOrderColumnVisible(columnPreference, key));
  const slots: InventorySlot[] = visibleKeys.flatMap((key, index): InventorySlot[] => {
    const previous = index > 0 ? inventoryColumnFamily(visibleKeys[index - 1]) : null;
    const dividerBefore = inventoryColumnFamily(key) === 'residual' && previous !== 'residual';
    const native = nativeByKey.get(key as (typeof columns)[number]['key']);
    if (native) {
      return [
        {
          kind: 'native' as const,
          id: native.id,
          label: native.label,
          dividerBefore,
          weight: columnLayout(columnPreference, native.id).weight,
          screenOnly: inventoryOrderColumnScreenOnly(columnPreference, key),
        },
      ];
    }
    const optional = optionalsByKey.get(key as RiskInventoryOptionalColumnSetting['key']);
    if (optional) return [{ kind: 'optional' as const, optional, dividerBefore }];
    const extra = extrasByKey.get(key as RiskInventoryExtraColumnSetting['key']);
    return extra ? [{ kind: 'extra' as const, extra, dividerBefore }] : [];
  });
  const headerGroups = inventoryHeaderRuns(visibleKeys);
  const headerVertical = (columnId: InventoryColumnId) =>
    inventoryScreenColumnHeaderOrientation(columnPreference, columnId) === 'VERTICAL';
  const headerLabel = (columnId: InventoryColumnId, fallback: string) =>
    inventoryScreenColumnHeaderLabel(columnPreference, columnId, fallback);
  const totalWeight = slots.reduce((sum, slot) => {
    if (slot.kind === 'native') return sum + slot.weight;
    if (slot.kind === 'optional') return sum + slot.optional.weight;
    return sum + slot.extra.weight;
  }, 0);
  const tableMinWidth = inventoryTableMinWidth(
    slots.flatMap((slot) => (slot.kind === 'native' ? [slot.weight] : [])),
  );
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
                  {slots.map((slot) => (
                    <col
                      key={
                        slot.kind === 'native'
                          ? slot.id
                          : slot.kind === 'optional'
                            ? slot.optional.key
                            : slot.extra.key
                      }
                      style={{
                        width: `${inventoryWidthPercent(
                          slot.kind === 'native'
                            ? slot.weight
                            : slot.kind === 'optional'
                              ? slot.optional.weight
                              : slot.extra.weight,
                          totalWeight,
                        )}%`,
                      }}
                    />
                  ))}
                </colgroup>
                <TableHead>
                  <TableRow>
                    {headerGroups.map((group, index) => (
                      <TableCell
                        key={`${group.family}-${index}`}
                        colSpan={group.colSpan}
                        align={group.family === 'occupation' ? 'left' : 'center'}
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
                          ...(group.family === 'residual' ? residualDividerSx : {}),
                        }}
                      >
                        {group.label}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    {slots.map((slot) => {
                      const screenOnly =
                        slot.kind === 'native'
                          ? slot.screenOnly
                          : slot.kind === 'optional'
                            ? slot.optional.screenOnly
                            : slot.extra.screenOnly;
                      const wrapHeader = (node: ReactNode) =>
                        screenOnly ? (
                          <Tooltip title={INVENTORY_SCREEN_ONLY_HINT}>
                            <Box component="span" sx={{ display: 'inline-block', maxWidth: '100%' }}>
                              {node}
                            </Box>
                          </Tooltip>
                        ) : (
                          node
                        );

                      if (slot.kind === 'extra') {
                        const column = slot.extra;
                        return (
                          <TableCell
                            key={column.key}
                            align={column.align}
                            title={screenOnly ? INVENTORY_SCREEN_ONLY_HINT : undefined}
                            aria-label={
                              screenOnly
                                ? `${column.label}. ${INVENTORY_SCREEN_ONLY_HINT}`
                                : column.label
                            }
                            sx={{
                              top: INVENTORY_GROUP_HEADER_PX,
                              zIndex: 3,
                              verticalAlign: 'bottom',
                              ...(column.align === 'center' ? { px: 0.5 } : {}),
                              fontWeight: 700,
                              fontSize: 12,
                              bgcolor: 'background.paper',
                              ...(column.headerVertical ? {} : { lineHeight: 1.15, whiteSpace: 'nowrap' }),
                              ...(slot.dividerBefore ? residualDividerSx : {}),
                              ...(screenOnly ? screenOnlySx : {}),
                            }}
                          >
                            {wrapHeader(
                              column.headerVertical ? (
                                <VerticalText
                                  text={column.label}
                                  linePx={inventoryVerticalHeaderBoxPx(column.label)}
                                  stackPx={column.stackPx}
                                  align={column.align}
                                />
                              ) : (
                                column.label
                              ),
                            )}
                          </TableCell>
                        );
                      }
                      if (slot.kind === 'optional') {
                        const column = slot.optional;
                        return (
                          <TableCell
                            key={column.key}
                            align={column.align}
                            title={screenOnly ? INVENTORY_SCREEN_ONLY_HINT : undefined}
                            aria-label={
                              screenOnly
                                ? `${column.label}. ${INVENTORY_SCREEN_ONLY_HINT}`
                                : column.label
                            }
                            sx={{
                              top: INVENTORY_GROUP_HEADER_PX,
                              zIndex: 3,
                              verticalAlign: 'bottom',
                              fontWeight: 700,
                              fontSize: 12,
                              bgcolor: 'background.paper',
                              ...(column.headerVertical ? {} : { lineHeight: 1.15, whiteSpace: 'nowrap' }),
                              ...(slot.dividerBefore ? residualDividerSx : {}),
                              ...(screenOnly ? screenOnlySx : {}),
                            }}
                          >
                            {wrapHeader(
                              column.headerVertical ? (
                                <VerticalText
                                  text={column.label}
                                  linePx={inventoryVerticalHeaderBoxPx(column.label)}
                                  stackPx={column.stackPx}
                                  align={column.align}
                                />
                              ) : (
                                column.label
                              ),
                            )}
                          </TableCell>
                        );
                      }
                      const layout = columnLayout(columnPreference, slot.id);
                      const title = headerLabel(slot.id, slot.label);
                      const isHeaderVertical = headerVertical(slot.id);
                      return (
                        <TableCell
                          key={slot.id}
                          align={slot.id === 'type' ? 'left' : layout.align}
                          title={screenOnly ? INVENTORY_SCREEN_ONLY_HINT : undefined}
                          aria-label={screenOnly ? `${title}. ${INVENTORY_SCREEN_ONLY_HINT}` : title}
                          sx={{
                            top: INVENTORY_GROUP_HEADER_PX,
                            zIndex: 3,
                            verticalAlign: 'bottom',
                            ...(layout.role === 'text' ? {} : { px: 0.5 }),
                            fontWeight: 700,
                            fontSize: 12,
                            ...(isHeaderVertical ? {} : { lineHeight: 1.15 }),
                            bgcolor: 'background.paper',
                            ...(isHeaderVertical || layout.role === 'text' ? {} : { whiteSpace: 'nowrap' }),
                            ...(slot.dividerBefore ? residualDividerSx : {}),
                            ...(screenOnly ? screenOnlySx : {}),
                          }}
                        >
                          {wrapHeader(
                            isHeaderVertical ? (
                              <VerticalText
                                text={title}
                                linePx={inventoryVerticalHeaderBoxPx(title)}
                                stackPx={layout.stackPx}
                                align={slot.id === 'type' ? 'left' : layout.align}
                              />
                            ) : (
                              title
                            ),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unit.rows.map((row) => (
                    <InventoryRow
                      key={`${unit.id}-${row.riskFactorId}-${row.originHomogeneousGroupIds.join(',')}`}
                      row={row}
                      slots={slots}
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
