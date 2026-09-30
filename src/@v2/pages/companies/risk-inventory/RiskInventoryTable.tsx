import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useState } from 'react';

import {
  RiskInventoryColumnsPreference,
  RiskInventoryPresentation,
  RiskInventoryRow,
  RiskInventoryUnit,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  formatInventoryEpis,
  formatInventoryLines,
  inventoryDefaultColumnLabel,
  inventoryExposedEmployeeText,
  inventoryHeaderGroups,
  inventoryOriginVisible,
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
  { id: 'type', label: inventoryDefaultColumnLabel('TYPE') },
  { id: 'hazard', label: inventoryDefaultColumnLabel('HAZARD') },
  { id: 'damage', label: inventoryDefaultColumnLabel('DAMAGE') },
  { id: 'source', label: inventoryDefaultColumnLabel('GENERATING_SOURCE') },
  { id: 'epi', label: inventoryDefaultColumnLabel('EPI') },
  { id: 'epc', label: inventoryDefaultColumnLabel('ENGINEERING') },
  { id: 'adm', label: inventoryDefaultColumnLabel('ADMINISTRATIVE') },
  { id: 'severity', label: inventoryDefaultColumnLabel('SEVERITY') },
  { id: 'probability', label: inventoryDefaultColumnLabel('PROBABILITY') },
  { id: 'real', label: inventoryDefaultColumnLabel('REAL_RISK') },
  { id: 'recs', label: inventoryDefaultColumnLabel('RECOMMENDATIONS'), dividerBefore: true },
  { id: 'pAfter', label: inventoryDefaultColumnLabel('PROBABILITY_RESIDUAL') },
  { id: 'residual', label: inventoryDefaultColumnLabel('RESIDUAL_RISK') },
] as const;

type InventoryColumnId = (typeof columns)[number]['id'] | 'origin';

function columnsFor(showOrigin: boolean) {
  if (!showOrigin) return columns;
  const origin = { id: 'origin' as const, label: inventoryDefaultColumnLabel('ORIGIN') };
  return [columns[0], origin, ...columns.slice(1)];
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
  showOrigin,
  columnPreference,
}: {
  row: RiskInventoryRow;
  showOrigin: boolean;
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

  return (
    <TableRow>
      <TableCell align="left" sx={{ ...cellSx, ...pad('type') }}>
        {renderText('type', textOrEmpty(row.riskTypeLabel || row.riskType))}
      </TableCell>
      {showOrigin ? (
        <TableCell align={layout('origin').align} sx={cellSx}>
          {renderText('origin', textOrEmpty(row.originText))}
        </TableCell>
      ) : null}
      <TableCell align={layout('hazard').align} sx={{ ...cellSx, fontWeight: 600 }}>
        {renderText('hazard', textOrEmpty(row.hazardName))}
      </TableCell>
      <TableCell align={layout('damage').align} sx={cellSx}>{renderText('damage', textOrEmpty(row.damage))}</TableCell>
      <TableCell align={layout('source').align} sx={cellSx}>{renderText('source', formatInventoryLines(row.generatingSources))}</TableCell>
      <TableCell align={layout('epi').align} sx={cellSx}>{renderText('epi', formatInventoryEpis(row.epis))}</TableCell>
      <TableCell align={layout('epc').align} sx={cellSx}>{renderText('epc', formatInventoryLines(row.engineeringMeasures))}</TableCell>
      <TableCell align={layout('adm').align} sx={cellSx}>{renderText('adm', formatInventoryLines(row.administrativeMeasures))}</TableCell>
      <TableCell align={layout('severity').align} sx={{ ...cellSx, ...pad('severity'), fontWeight: 700 }}>
        {renderText('severity', textOrEmpty(row.severity))}
      </TableCell>
      <TableCell align={layout('probability').align} sx={{ ...cellSx, ...pad('probability'), fontWeight: 700 }}>
        {renderText('probability', inventoryProbabilityText(row), probabilityHint)}
      </TableCell>
      <TableCell
        align={layout('real').align}
        sx={{ ...cellSx, ...pad('real'), ...(vertical('real') ? { verticalAlign: 'top' } : {}) }}
      >
        <RiskPill
          presentation={row.realRisk}
          compact={vertical('real')}
          stackPx={layout('real').stackPx}
          align={layout('real').align}
          contentAlignY="top"
        />
      </TableCell>
      <TableCell align={layout('recs').align} sx={{ ...cellSx, ...residualDividerSx }}>
        {renderText('recs', formatInventoryLines(row.recommendations))}
      </TableCell>
      <TableCell align={layout('pAfter').align} sx={{ ...cellSx, ...pad('pAfter'), fontWeight: 700 }}>
        {renderText('pAfter', inventoryResidualProbabilityText(row))}
      </TableCell>
      <TableCell
        align={layout('residual').align}
        sx={{ ...cellSx, ...pad('residual'), ...(vertical('residual') ? { verticalAlign: 'top' } : {}) }}
      >
        <RiskPill
          presentation={row.residual.presentation}
          compact={vertical('residual')}
          stackPx={layout('residual').stackPx}
          align={layout('residual').align}
          contentAlignY="top"
        />
      </TableCell>
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
  const showOrigin = inventoryOriginVisible(columnPreference);
  const headerGroups = inventoryHeaderGroups(showOrigin);
  const headerVertical = (columnId: InventoryColumnId) =>
    inventoryScreenColumnHeaderOrientation(columnPreference, columnId) === 'VERTICAL';
  const headerLabel = (columnId: InventoryColumnId, fallback: string) =>
    inventoryScreenColumnHeaderLabel(columnPreference, columnId, fallback);
  const layouts = columnsFor(showOrigin).map((column) => ({
    ...column,
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
                          ...('dividerBefore' in column ? residualDividerSx : {}),
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
                      showOrigin={showOrigin}
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
