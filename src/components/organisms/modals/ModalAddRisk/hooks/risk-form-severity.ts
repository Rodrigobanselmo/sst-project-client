/** Valor do campo `severity` do formulário ('1'–'5'); severidades fora de 1–5 ficam sem seleção. */
export const toRiskFormSeverity = (value: unknown): string | undefined => {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  if (typeof value === 'string' && !value.trim()) return undefined;

  const severity = Number(value);
  return Number.isInteger(severity) && severity >= 1 && severity <= 5
    ? String(severity)
    : undefined;
};
