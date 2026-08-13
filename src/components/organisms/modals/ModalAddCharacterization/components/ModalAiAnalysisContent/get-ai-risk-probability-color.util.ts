export function getAiRiskProbabilityColor(probability: number): string {
  const scale = {
    low: '#3cbe7d',
    mediumLow: '#8fa728',
    medium: '#d9d10b',
    mediumHigh: '#d96c2f',
    high: '#F44336',
  };

  if (probability <= 1) return scale.low;
  if (probability <= 2) return scale.mediumLow;
  if (probability <= 3) return scale.medium;
  if (probability <= 4) return scale.mediumHigh;
  return scale.high;
}
