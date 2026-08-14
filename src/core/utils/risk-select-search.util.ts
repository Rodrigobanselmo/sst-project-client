/**
 * Campos e normalização de busca do seletor compartilhado de fatores de risco (Fuse).
 * Não altera o contrato da API: só deriva campos pesquisáveis no client.
 */

export const RISK_SELECT_FUSE_KEYS = [
  'name',
  'cas',
  'casDigits',
  'synonymous',
  'search',
] as const;

/** Campos só de indexação. Não fazem parte do RiskFactor devolvido ao consumidor. */
export const RISK_SELECT_AUXILIARY_KEYS = ['casDigits'] as const;

/** CAS típico: só dígitos, hífens, pontos e espaços, com pelo menos 5 dígitos. */
const CAS_LIKE_QUERY = /^[\d\s.\-]+$/;

export function compactCasDigits(
  value: string | null | undefined,
): string {
  if (!value) return '';
  return String(value).replace(/\D/g, '');
}

export function looksLikeCasQuery(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  if (!CAS_LIKE_QUERY.test(trimmed)) return false;
  return compactCasDigits(trimmed).length >= 5;
}

/** Compacta a query só quando ela tem perfil de CAS/números. Nome e sinônimo ficam intactos. */
export function normalizeRiskSelectSearchQuery(query: string): string {
  if (looksLikeCasQuery(query)) return compactCasDigits(query);
  return query;
}

export function normalizeSynonymousList(value: unknown): string[] {
  if (value == null || value === '') return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeSynonymousList(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return normalizeSynonymousList(parsed);
      } catch {
        return [trimmed];
      }
    }

    return [trimmed];
  }

  return [];
}

export function mapRiskSelectSearchFields<
  T extends {
    cas?: string | null;
  },
>(
  risk: T,
): T & {
  casDigits: string;
} {
  return {
    ...risk,
    casDigits: compactCasDigits(risk.cas),
  };
}

export function toRiskSelectDomainOption<T extends { casDigits?: string }>(
  option: T,
): Omit<T, 'casDigits'> {
  const { casDigits: _casDigits, ...domain } = option;
  return domain;
}
