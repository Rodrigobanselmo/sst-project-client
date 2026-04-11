/** Mesma escala de cores dos indicadores FRPS (FormQuestionsDashboard), 0–1. */
export function getResponseRateIndicatorColor(value01: number): string {
  if (value01 >= 0.8) return '#3cbe7d';
  if (value01 >= 0.6) return '#8fa728';
  if (value01 >= 0.4) return '#d9d10b';
  if (value01 >= 0.2) return '#d96c2f';
  return '#F44336';
}

export function getResponseRateBarColor(percent0to100: number): string {
  return getResponseRateIndicatorColor(Math.min(1, Math.max(0, percent0to100 / 100)));
}
