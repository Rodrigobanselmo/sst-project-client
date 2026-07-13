/**
 * Detecta equivalência global a partir do metadata persistido.
 * Aceita booleans, strings e shapes parciais do payload Master.
 */
export function isRiskCatalogGlobalEquivalenceMetadata(
  metadata: unknown,
): boolean {
  if (!metadata) return false;

  let data: Record<string, unknown> | null = null;

  if (typeof metadata === 'string') {
    try {
      const parsed = JSON.parse(metadata) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        data = parsed as Record<string, unknown>;
      }
    } catch {
      return false;
    }
  } else if (typeof metadata === 'object' && !Array.isArray(metadata)) {
    data = metadata as Record<string, unknown>;
  }

  if (!data) return false;

  if (isTruthyFlag(data.crossScope) || isTruthyFlag(data.globalEquivalence)) {
    return true;
  }

  const source = typeof data.source === 'string' ? data.source.toLowerCase() : '';
  return (
    source.includes('global-equivalence') ||
    source.includes('catalog-global')
  );
}

function isTruthyFlag(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }
  return false;
}
