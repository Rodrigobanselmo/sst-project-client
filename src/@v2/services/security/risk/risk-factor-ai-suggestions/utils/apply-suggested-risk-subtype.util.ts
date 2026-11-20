type Identity = { type?: string; name?: string; cas?: string; subType?: string | number };
type Subtype = { id: number; name: string; type: string };

export function isSameRiskSuggestionIdentity(current: Identity, requested: Identity) {
  return (['type', 'name', 'cas'] as const).every(
    (key) => String(current[key] ?? '').trim() === String(requested[key] ?? '').trim(),
  );
}

export function resolveSuggestedRiskSubtype(
  current: Identity,
  requested: Identity,
  suggestion: Subtype | null | undefined,
  candidates: Subtype[],
): string | undefined {
  const existing = String(current.subType ?? '').trim();
  if (existing && existing !== 'null') return;
  if (!suggestion || !isSameRiskSuggestionIdentity(current, requested)) return;
  if (suggestion.type !== current.type || !Number.isInteger(suggestion.id)) return;
  if (!candidates.some((item) => item.id === suggestion.id && item.type === suggestion.type)) return;
  return String(suggestion.id);
}
