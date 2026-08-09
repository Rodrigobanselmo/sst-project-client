export type RiskFactorIpvsMeta = {
  unit?: string;
  reference?: string;
  origin?: string;
};

type RiskFactorJsonLike = {
  ipvs?: RiskFactorIpvsMeta | null;
  limits?: {
    lel?: unknown;
  } | null;
} | null;

/** Lê json.ipvs (Modelo 2: unidade/referência do IPVS). */
export function extractRiskFactorIpvsMeta(
  json: unknown,
): RiskFactorIpvsMeta | null {
  if (!json || typeof json !== 'object') return null;
  const meta = (json as RiskFactorJsonLike)?.ipvs;
  if (!meta || typeof meta !== 'object') return null;
  const unit = typeof meta.unit === 'string' ? meta.unit.trim() : '';
  const reference =
    typeof meta.reference === 'string' ? meta.reference.trim() : '';
  const origin = typeof meta.origin === 'string' ? meta.origin.trim() : '';
  if (!unit && !reference) return null;
  return {
    unit: unit || undefined,
    reference: reference || undefined,
    origin: origin || undefined,
  };
}
