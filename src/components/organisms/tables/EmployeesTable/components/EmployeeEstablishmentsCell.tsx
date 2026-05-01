import {
  FC,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box, Tooltip, Typography } from '@mui/material';

import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IWorkspace } from 'core/interfaces/api/ICompany';

/** Collation natural (ex.: BS, BS-1, BS-2, …, BS-10) para sigla e desempate por nome. */
const ESTABLISHMENT_SORT_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

export type EstablishmentRow = { sigla: string; fullName: string };

let measureCanvas: HTMLCanvasElement | null = null;

function measureTextWidthPx(text: string, fontCss: string): number {
  if (typeof document === 'undefined') return 0;
  if (!measureCanvas) measureCanvas = document.createElement('canvas');
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = fontCss;
  return ctx.measureText(text).width;
}

/** Texto compacto com até `visibleSiglas` primeiras siglas; restante vira `+N`. */
export function buildEstablishmentsCompact(
  rows: EstablishmentRow[],
  visibleSiglas: number,
): string {
  if (rows.length === 0) return '';
  const n = Math.min(Math.max(visibleSiglas, 1), rows.length);
  if (n >= rows.length) return rows.map((r) => r.sigla).join('; ');
  return (
    rows
      .slice(0, n)
      .map((r) => r.sigla)
      .join('; ') + ` +${rows.length - n}`
  );
}

/** Maior número de siglas que cabem em `maxWidthPx` medindo o mesmo texto renderizado. */
function computeMaxFitSiglas(
  rows: EstablishmentRow[],
  maxWidthPx: number,
  measure: (s: string) => number,
): number {
  if (rows.length <= 1 || maxWidthPx <= 4) return rows.length;
  const slack = 2;
  for (let k = rows.length; k >= 1; k--) {
    const label = buildEstablishmentsCompact(rows, k);
    if (measure(label) <= maxWidthPx - slack) return k;
  }
  return 1;
}

function compareEstablishmentRows(a: EstablishmentRow, b: EstablishmentRow): number {
  const bySigla = ESTABLISHMENT_SORT_COLLATOR.compare(
    a.sigla.trim(),
    b.sigla.trim(),
  );
  if (bySigla !== 0) return bySigla;
  return ESTABLISHMENT_SORT_COLLATOR.compare(
    a.fullName.trim(),
    b.fullName.trim(),
  );
}

function pickWorkspaceSigla(ws: IWorkspace): string {
  const anyWs = ws as IWorkspace & {
    shortName?: string | null;
    code?: string | null;
    initials?: string | null;
  };
  const abbr = ws.abbreviation?.trim();
  if (abbr) return abbr;
  const shortName = anyWs.shortName?.trim();
  if (shortName) return shortName;
  const initials = anyWs.initials?.trim();
  if (initials) return initials;
  const code = anyWs.code?.trim();
  if (code) return code;
  const name = (ws.name || '').trim();
  if (!name) return '—';
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

function pickSubOfficeSigla(sub: IHierarchy): { sigla: string; fullName: string } | null {
  const fullName = (sub.name || '').trim();
  const ref = (sub.refName || '').trim();
  const sigla =
    ref ||
    (fullName.length > 14 ? `${fullName.slice(0, 12)}…` : fullName || '');
  if (!fullName && !ref) return null;
  return { sigla: sigla || '—', fullName: fullName || ref || sigla };
}

function putWorkspaces(
  byKey: Map<string, EstablishmentRow>,
  workspaces: IWorkspace[] | undefined,
): void {
  for (const ws of workspaces || []) {
    if (!ws?.id || byKey.has(ws.id)) continue;
    const fullName = (ws.name || '').trim() || pickWorkspaceSigla(ws);
    byKey.set(ws.id, {
      sigla: pickWorkspaceSigla(ws),
      fullName,
    });
  }
}

/**
 * Consolida estabelecimentos do cargo atual (organograma — hierarchy.workspaces)
 * com os das sub-lotações (subOffices.workspaces), deduplicando por workspace id.
 *
 * Ordem de exibição: após dedupe, ordena pela sigla exibida (comparação natural);
 * antes era só a ordem de inserção no Map (API: hierarchy.workspaces, depois cada subOffice).
 */
export function collectEmployeeEstablishments(
  employee: IEmployee,
): EstablishmentRow[] {
  const byKey = new Map<string, EstablishmentRow>();

  putWorkspaces(byKey, employee.hierarchy?.workspaces);

  for (const sub of employee.subOffices || []) {
    const workspaces = sub.workspaces || [];
    if (workspaces.length > 0) {
      putWorkspaces(byKey, workspaces);
    } else {
      const picked = pickSubOfficeSigla(sub);
      if (picked) byKey.set(`sub:${sub.id}`, picked);
    }
  }

  const list = Array.from(byKey.values());
  list.sort(compareEstablishmentRows);
  return list;
}

export const EmployeeEstablishmentsCell: FC<{ employee: IEmployee }> = ({
  employee,
}) => {
  const rows = useMemo(
    () => collectEmployeeEstablishments(employee),
    [employee],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [availableWidthPx, setAvailableWidthPx] = useState(0);

  const readAvailableWidth = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const pad =
      (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    setAvailableWidthPx(Math.max(0, el.clientWidth - pad));
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    readAvailableWidth();
    const ro = new ResizeObserver(() => readAvailableWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, readAvailableWidth]);

  const fitSiglaCount = useMemo(() => {
    if (rows.length <= 1) return rows.length;
    const el = containerRef.current;
    if (!el || availableWidthPx <= 0) return rows.length;
    const cs = getComputedStyle(el);
    const fontCss = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const measure = (s: string) => measureTextWidthPx(s, fontCss);
    return computeMaxFitSiglas(rows, availableWidthPx, measure);
  }, [rows, availableWidthPx]);

  const compact = useMemo(
    () => buildEstablishmentsCompact(rows, fitSiglaCount),
    [rows, fitSiglaCount],
  );

  const tooltipText = rows.map((r) => `${r.sigla} — ${r.fullName}`).join('\n');

  if (!rows.length) {
    return (
      <Typography component="span" variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }

  /** Um único estabelecimento: alinha o balão ao início da sigla (evita seta centrada na coluna inteira). */
  const singleEstablishment = rows.length === 1;

  return (
    <Tooltip
      title={
        <span style={{ whiteSpace: 'pre-line', display: 'block', maxWidth: 360 }}>
          {tooltipText}
        </span>
      }
      placement={singleEstablishment ? 'top-start' : 'top'}
      arrow
      slotProps={{
        popper: {
          modifiers: [{ name: 'offset', options: { offset: [0, -6] } }],
        },
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          minWidth: 0,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'default',
          fontSize: 11,
          color: 'text.secondary',
        }}
      >
        {compact}
      </Box>
    </Tooltip>
  );
};
