export const NIOSH_METHOD_NOT_FOUND_REFERENCE =
  'Pesquisa realizada no NIOSH NMAM · método não encontrado';

export function hasCurrentNioshNotFoundSearch(risk: {
  name?: string;
  cas?: string | null;
  json?: { [key: string]: unknown } | null;
}): boolean {
  const evidence = risk.json?.nioshMethodSearch;
  if (!evidence || typeof evidence !== 'object') return false;

  return (
    'status' in evidence &&
    evidence.status === 'NOT_FOUND' &&
    'cas' in evidence &&
    evidence.cas === (risk.cas?.trim() || null) &&
    (('casNormalizationVersion' in evidence &&
      evidence.casNormalizationVersion === 2) ||
      !/[\d-][^\S\r\n]+[\d-]/.test(risk.cas ?? '')) &&
    (('casNumbers' in evidence && Array.isArray(evidence.casNumbers)) ||
      (risk.cas?.match(/\b\d{2,7}-\d{2}-\d\b/g)?.length ?? 0) < 2) &&
    'names' in evidence &&
    Array.isArray(evidence.names) &&
    evidence.names.includes(risk.name?.trim())
  );
}
