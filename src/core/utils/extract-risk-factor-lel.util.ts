export type RiskFactorLelLimit = {
  value?: string;
  unit?: string;
  source?: string;
  origin?: string;
  note?: string;
};

type RiskFactorJsonLike = {
  limits?: {
    lel?: RiskFactorLelLimit | null;
  } | null;
} | null;

/** Lê json.limits.lel sem inferir IDLH/IPVS. */
export function extractRiskFactorLel(
  json: unknown,
): RiskFactorLelLimit | null {
  if (!json || typeof json !== 'object') return null;
  const lel = (json as RiskFactorJsonLike)?.limits?.lel;
  if (!lel || typeof lel !== 'object') return null;
  const value = typeof lel.value === 'string' ? lel.value.trim() : '';
  if (!value) return null;
  return {
    value,
    unit: typeof lel.unit === 'string' ? lel.unit : undefined,
    source: typeof lel.source === 'string' ? lel.source : undefined,
    origin: typeof lel.origin === 'string' ? lel.origin : undefined,
    note: typeof lel.note === 'string' ? lel.note : undefined,
  };
}
