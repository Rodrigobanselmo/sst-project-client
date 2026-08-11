import type {
  ChemicalOccupationalSearchAudit,
  ChemicalOccupationalSearchStatus,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

const SOURCE_SHORT: Record<string, string> = {
  NIOSH_POCKET_GUIDE: 'NIOSH',
  OSHA_OCCUPATIONAL_CHEMICAL_DB: 'OSHA',
};

export function parseOccupationalSearchAudit(
  json: unknown,
): ChemicalOccupationalSearchAudit | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  const block = (json as { occupationalSearch?: unknown }).occupationalSearch;
  if (!block || typeof block !== 'object' || Array.isArray(block)) return null;
  const audit = block as Partial<ChemicalOccupationalSearchAudit>;
  if (!audit.status || !audit.searchedAt) return null;
  return audit as ChemicalOccupationalSearchAudit;
}

function formatSearchDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

function formatSourcesShort(sources: string[] | undefined): string {
  const labels = (sources || [])
    .map((source) => SOURCE_SHORT[source] || source)
    .filter(Boolean);
  if (!labels.length) return 'NIOSH/OSHA';
  return Array.from(new Set(labels)).join('/');
}

export function formatOccupationalSearchStatusLabel(
  audit: ChemicalOccupationalSearchAudit | null | undefined,
): string {
  if (!audit?.status || !audit.searchedAt) {
    return 'Nenhuma pesquisa registrada';
  }

  const date = formatSearchDate(audit.searchedAt);
  const status = audit.status as ChemicalOccupationalSearchStatus;

  switch (status) {
    case 'NOT_FOUND':
      return `Última pesquisa: ${date} · ${formatSourcesShort(audit.sourcesConsulted)} · nenhum limite localizado`;
    case 'FOUND':
      return `Última pesquisa: ${date} · limites encontrados`;
    case 'REVIEW_REQUIRED':
      return `Última pesquisa: ${date} · revisão necessária`;
    case 'INCOMPLETE':
      return `Última pesquisa: ${date} · pesquisa incompleta`;
    default:
      return `Última pesquisa: ${date}`;
  }
}

export function formatOccupationalSearchTooltip(
  audit: ChemicalOccupationalSearchAudit | null | undefined,
): string {
  if (!audit) return 'Nenhuma pesquisa de limites ocupacionais registrada.';

  const lines = [
    `CAS: ${audit.cas || '—'}`,
    `Status: ${audit.status}`,
    `Fontes: ${(audit.sourcesConsulted || []).join(', ') || '—'}`,
  ];

  if (audit.summary?.message) {
    lines.push(audit.summary.message);
  }

  for (const provider of audit.providers || []) {
    lines.push(
      `${provider.provider}: ${provider.outcome}${
        provider.reason ? ` (${provider.reason})` : ''
      }`,
    );
  }

  return lines.join('\n');
}
