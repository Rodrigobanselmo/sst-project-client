import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { resolveRiskChip } from 'core/utils/risk-chip.util';
import { RiskEnum } from 'project/enum/risk.enums';

import {
  RiskTechnicalColumnOrientation,
  RiskTechnicalColumnsPreference,
  RiskTechnicalDataRisk,
} from '@v2/services/security/risk-technical-data/risk-technical-data.types';

import {
  RISK_TECHNICAL_DATA_BAND,
  RISK_TECHNICAL_DATA_GRID,
  RISK_TECHNICAL_DATA_INK,
  RISK_TECHNICAL_DATA_SURFACE,
  RiskTechnicalColumnAlign,
  RiskTechnicalColumnLayout,
  RiskTechnicalDataGroup,
  riskTechnicalCellText,
  riskTechnicalLayouts,
  risksForTechnicalGroup,
} from './risk-technical-data.presentation';

const cellBorder = `1px solid ${RISK_TECHNICAL_DATA_GRID}`;

const tagRisk = (risk: RiskTechnicalDataRisk): IRiskFactors =>
  ({
    id: risk.id,
    name: risk.name,
    type: risk.type as RiskEnum,
    subTypes: risk.subTypes.map((subtype) => ({
      sub_type: { id: String(subtype.id), name: subtype.name },
    })),
  }) as IRiskFactors;

export function RiskTechnicalDataGrid({
  risks,
  group,
  columnPreference,
}: {
  risks: RiskTechnicalDataRisk[];
  group: RiskTechnicalDataGroup;
  columnPreference: RiskTechnicalColumnsPreference | null;
}) {
  const layouts = useMemo(
    () => riskTechnicalLayouts(group, columnPreference),
    [group, columnPreference],
  );
  const rows = useMemo(() => risksForTechnicalGroup(risks, group), [risks, group]);
  const tableRef = useRef<HTMLTableElement>(null);
  const [stickyTop, setStickyTop] = useState(0);

  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const bars = stickyBarsAbove(table);
    const measure = () => {
      const next = bars.reduce((sum, bar) => sum + bar.getBoundingClientRect().height, 0);
      setStickyTop((current) => (current === next ? current : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    bars.forEach((bar) => observer.observe(bar));
    return () => observer.disconnect();
  }, [group]);

  return (
    <TableContainer
      sx={{
        width: '100%',
        overflow: 'visible',
        bgcolor: RISK_TECHNICAL_DATA_SURFACE,
        border: cellBorder,
        borderRadius: 1,
      }}
    >
      <Table
        ref={tableRef}
        size="small"
        sx={{
          tableLayout: 'fixed',
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <colgroup>
          {layouts.map((column) => (
            <col key={column.key} style={{ width: `${column.percent}%` }} />
          ))}
        </colgroup>
        <TableHead>
          <TableRow>
            {layouts.map((column, index) => (
              <HeaderCell key={column.key} column={column} sticky={index === 0} stickyTop={stickyTop} />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((risk) => (
            <TableRow key={risk.id} hover>
              {layouts.map((column, index) => (
                <BodyCell key={column.key} risk={risk} column={column} sticky={index === 0} />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function OrientedText({
  text,
  orientation,
}: {
  text: string;
  orientation: RiskTechnicalColumnOrientation;
}) {
  if (orientation === 'HORIZONTAL') {
    return (
      <Box component="span" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {text}
      </Box>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {text}
    </Box>
  );
}

function RiskTechnicalTypeMark({
  risk,
  orientation,
}: {
  risk: RiskTechnicalDataRisk;
  orientation: RiskTechnicalColumnOrientation;
}) {
  const chip = resolveRiskChip(tagRisk(risk));
  const vertical = orientation === 'VERTICAL';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        writingMode: vertical ? 'vertical-rl' : 'horizontal-tb',
        transform: vertical ? 'rotate(180deg)' : undefined,
        bgcolor: chip.colorKey,
        color: chip.isPsicChip ? 'grey.900' : 'common.white',
        ...(chip.isPsicChip
          ? { border: '1px solid', borderColor: 'risk.erg', fontWeight: 600 }
          : { fontWeight: 700 }),
        fontSize: 9,
        lineHeight: 1,
        px: vertical ? '1px' : '4px',
        py: vertical ? '4px' : '1px',
        borderRadius: '3px',
        width: 'max-content',
        maxWidth: '100%',
        whiteSpace: 'nowrap',
      }}
    >
      {chip.label}
    </Box>
  );
}

function alignedContentSx(align: RiskTechnicalColumnAlign, place: 'header' | 'body') {
  return {
    display: 'flex',
    width: '100%',
    justifyContent: align === 'center' ? 'center' : 'flex-start',
    alignItems: place === 'header' ? 'flex-end' : 'flex-start',
    textAlign: align,
  } as const;
}

function stickyBarsAbove(table: HTMLElement): HTMLElement[] {
  const bars: HTMLElement[] = [];
  let node: HTMLElement | null = table;

  while (node) {
    const parent = node.parentElement;
    if (!parent) break;
    for (const child of Array.from(parent.children)) {
      if (child === node) break;
      if (!(child instanceof HTMLElement)) continue;
      if (getComputedStyle(child).position === 'sticky') bars.push(child);
    }
    const parentOverflow = getComputedStyle(parent).overflowY;
    if (parentOverflow === 'auto' || parentOverflow === 'scroll') break;
    node = parent;
  }

  return bars;
}

function HeaderCell({
  column,
  sticky,
  stickyTop,
}: {
  column: RiskTechnicalColumnLayout;
  sticky: boolean;
  stickyTop: number;
}) {
  return (
    <TableCell
      component="th"
      sx={{
        position: 'sticky',
        top: stickyTop,
        left: sticky ? 0 : undefined,
        zIndex: sticky ? 4 : 3,
        bgcolor: RISK_TECHNICAL_DATA_BAND,
        color: RISK_TECHNICAL_DATA_INK,
        fontWeight: 700,
        fontSize: 12,
        verticalAlign: 'bottom',
        textAlign: column.align,
        borderBottom: cellBorder,
        borderRight: cellBorder,
        px: column.key === 'type' ? 0.25 : 0.75,
      }}
    >
      <Box sx={alignedContentSx(column.align, 'header')}>
        <OrientedText text={column.headerLabel} orientation={column.headerOrientation} />
      </Box>
    </TableCell>
  );
}

function BodyCell({
  risk,
  column,
  sticky,
}: {
  risk: RiskTechnicalDataRisk;
  column: RiskTechnicalColumnLayout;
  sticky: boolean;
}) {
  const value = riskTechnicalCellText(risk, column.key);
  const content =
    column.key === 'type' ? (
      <RiskTechnicalTypeMark risk={risk} orientation={column.contentOrientation} />
    ) : (
      <OrientedText text={value} orientation={column.contentOrientation} />
    );

  return (
    <TableCell
      sx={{
        position: sticky ? 'sticky' : undefined,
        left: sticky ? 0 : undefined,
        zIndex: sticky ? 1 : undefined,
        verticalAlign: column.key === 'type' ? 'middle' : 'top',
        textAlign: column.align,
        bgcolor: RISK_TECHNICAL_DATA_SURFACE,
        color: RISK_TECHNICAL_DATA_INK,
        borderBottom: cellBorder,
        borderRight: cellBorder,
        px: column.key === 'type' ? 0.25 : 0.75,
        py: column.key === 'type' ? 0.5 : undefined,
      }}
    >
      <Box
        sx={
          column.key === 'type'
            ? {
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : alignedContentSx(column.align, 'body')
        }
      >
        {column.contentOrientation === 'HORIZONTAL' && value.length > 48 ? (
          <Tooltip title={<Box sx={{ whiteSpace: 'pre-wrap' }}>{value}</Box>}>
            <Box component="span">{content}</Box>
          </Tooltip>
        ) : (
          content
        )}
      </Box>
    </TableCell>
  );
}
