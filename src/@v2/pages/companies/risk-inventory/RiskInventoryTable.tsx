import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

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
  INVENTORY_HEADER_GROUPS,
  inventoryPresentationColor,
  inventoryPresentationText,
  inventoryProbabilityHint,
  inventoryProbabilityText,
  inventoryResidualProbabilityText,
  inventoryScreenColumnHeaderLabel,
  inventoryScreenColumnHeaderOrientation,
  inventoryScreenColumnOrientation,
  inventoryUnitScopeText,
  inventoryVerticalRiskText,
  INVENTORY_VERTICAL_HEADER_LINE_PX,
  INVENTORY_VERTICAL_LINE_PX,
  INVENTORY_VERTICAL_ROTATION,
  INVENTORY_VERTICAL_STACK_PX,
  INVENTORY_EMPTY,
  INVENTORY_EXPOSED_LABEL,
  INVENTORY_SCOPE_LABEL,
} from './risk-inventory.presentation';

const columns = [
  { id: 'type', label: inventoryDefaultColumnLabel('TYPE'), minWidth: 88 },
  { id: 'hazard', label: inventoryDefaultColumnLabel('HAZARD'), minWidth: 180 },
  { id: 'damage', label: inventoryDefaultColumnLabel('DAMAGE'), minWidth: 160 },
  { id: 'source', label: inventoryDefaultColumnLabel('GENERATING_SOURCE'), minWidth: 160 },
  { id: 'epi', label: inventoryDefaultColumnLabel('EPI'), minWidth: 160 },
  { id: 'epc', label: inventoryDefaultColumnLabel('ENGINEERING'), minWidth: 140 },
  { id: 'adm', label: inventoryDefaultColumnLabel('ADMINISTRATIVE'), minWidth: 140 },
  { id: 'severity', label: inventoryDefaultColumnLabel('SEVERITY'), minWidth: 48 },
  { id: 'probability', label: inventoryDefaultColumnLabel('PROBABILITY'), minWidth: 48 },
  { id: 'real', label: inventoryDefaultColumnLabel('REAL_RISK'), minWidth: 140 },
  { id: 'recs', label: inventoryDefaultColumnLabel('RECOMMENDATIONS'), minWidth: 180, dividerBefore: true },
  { id: 'pAfter', label: inventoryDefaultColumnLabel('PROBABILITY_RESIDUAL'), minWidth: 72 },
  { id: 'residual', label: inventoryDefaultColumnLabel('RESIDUAL_RISK'), minWidth: 150 },
] as const;

const cellSx = {
  verticalAlign: 'top',
  whiteSpace: 'pre-line',
  fontSize: 13,
  lineHeight: 1.35,
  py: 1,
};

const INVENTORY_GROUP_HEADER_PX = 32;

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
}: {
  text: string;
  title?: string;
  tone?: { bgcolor: string; color: string };
  linePx?: number;
}) {
  return (
    <Box
      component="div"
      title={title ?? text}
      sx={{
        position: 'relative',
        height: linePx,
        width: INVENTORY_VERTICAL_STACK_PX,
        maxHeight: linePx,
        maxWidth: INVENTORY_VERTICAL_STACK_PX,
        overflow: 'hidden',
        mx: 'auto',
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: linePx,
          height: INVENTORY_VERTICAL_STACK_PX,
          boxSizing: 'border-box',
          transform: `translate(-50%, -50%) ${INVENTORY_VERTICAL_ROTATION}`,
          transformOrigin: 'center center',
          overflow: 'hidden',
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          lineHeight: 1.25,
          textAlign: 'left',
          display: 'block',
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
}: {
  presentation: RiskInventoryPresentation | null;
  compact?: boolean;
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
  columnPreference,
}: {
  row: RiskInventoryRow;
  columnPreference: RiskInventoryColumnsPreference | null;
}) {
  const probabilityHint = inventoryProbabilityHint(row);
  const vertical = (columnId: Parameters<typeof inventoryScreenColumnOrientation>[1]) =>
    inventoryScreenColumnOrientation(columnPreference, columnId) === 'VERTICAL';
  const renderText = (
    columnId: Parameters<typeof inventoryScreenColumnOrientation>[1],
    text: string,
    extraTitle?: string | null,
  ) => {
    if (!vertical(columnId)) return text;
    const title = [text, extraTitle].filter(Boolean).join('\n');
    return <VerticalText text={text} title={title} />;
  };

  return (
    <TableRow>
      <TableCell sx={cellSx}>{renderText('type', textOrEmpty(row.riskTypeLabel || row.riskType))}</TableCell>
      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
        {renderText('hazard', textOrEmpty(row.hazardName))}
      </TableCell>
      <TableCell sx={cellSx}>{renderText('damage', textOrEmpty(row.damage))}</TableCell>
      <TableCell sx={cellSx}>{renderText('source', formatInventoryLines(row.generatingSources))}</TableCell>
      <TableCell sx={cellSx}>{renderText('epi', formatInventoryEpis(row.epis))}</TableCell>
      <TableCell sx={cellSx}>{renderText('epc', formatInventoryLines(row.engineeringMeasures))}</TableCell>
      <TableCell sx={cellSx}>{renderText('adm', formatInventoryLines(row.administrativeMeasures))}</TableCell>
      <TableCell sx={{ ...cellSx, fontWeight: 700 }} align="center">
        {renderText('severity', textOrEmpty(row.severity))}
      </TableCell>
      <TableCell sx={{ ...cellSx, fontWeight: 700 }} align="center">
        {renderText('probability', inventoryProbabilityText(row), probabilityHint)}
      </TableCell>
      <TableCell sx={cellSx}>
        <RiskPill presentation={row.realRisk} compact={vertical('real')} />
      </TableCell>
      <TableCell sx={{ ...cellSx, ...residualDividerSx }}>
        {renderText('recs', formatInventoryLines(row.recommendations))}
      </TableCell>
      <TableCell sx={{ ...cellSx, fontWeight: 700 }} align="center">
        {renderText('pAfter', inventoryResidualProbabilityText(row))}
      </TableCell>
      <TableCell sx={cellSx}>
        <RiskPill presentation={row.residual.presentation} compact={vertical('residual')} />
      </TableCell>
    </TableRow>
  );
}

function UnitHeader({ unit }: { unit: RiskInventoryUnit }) {
  const scope = inventoryUnitScopeText(unit.scope);

  return (
    <Box sx={{ px: 1.5, py: 1.25, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {unit.name}
      </Typography>
      {unit.description ? (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {unit.description}
        </Typography>
      ) : null}
      {scope ? (
        <Typography variant="body2" sx={{ mt: 0.75 }}>
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
  const headerVertical = (columnId: (typeof columns)[number]['id']) =>
    inventoryScreenColumnHeaderOrientation(columnPreference, columnId) === 'VERTICAL';
  const headerLabel = (columnId: (typeof columns)[number]['id'], fallback: string) =>
    inventoryScreenColumnHeaderLabel(columnPreference, columnId, fallback);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {units.map((unit) => (
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
          <UnitHeader unit={unit} />
          {unit.rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 2 }}>
              Nenhum fator de risco neste grupo.
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 1480 }}>
                <TableHead>
                  <TableRow>
                    {INVENTORY_HEADER_GROUPS.map((group) => (
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
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          top: INVENTORY_GROUP_HEADER_PX,
                          zIndex: 3,
                          minWidth: column.minWidth,
                          fontWeight: 700,
                          fontSize: 12,
                          bgcolor: 'background.paper',
                          ...(headerVertical(column.id) ? {} : { whiteSpace: 'nowrap' }),
                          ...('dividerBefore' in column ? residualDividerSx : {}),
                        }}
                      >
                        {headerVertical(column.id) ? (
                          <VerticalText
                            text={headerLabel(column.id, column.label)}
                            linePx={INVENTORY_VERTICAL_HEADER_LINE_PX}
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
                      key={`${unit.id}-${row.riskFactorId}`}
                      row={row}
                      columnPreference={columnPreference}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ))}
    </Box>
  );
}
