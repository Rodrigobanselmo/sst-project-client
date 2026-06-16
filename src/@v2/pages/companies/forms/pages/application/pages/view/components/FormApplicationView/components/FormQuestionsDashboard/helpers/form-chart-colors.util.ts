export const IDENTIFIER_CHART_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFEAA7',
  '#00c8f5',
  '#DDA0DD',
  '#F8C471',
  '#F7DC6F',
  '#98D8C8',
  '#BB8FCE',
  '#85C1E9',
  '#96CEB4',
  '#82E0AA',
] as const;

export function getAnswerOptionColorByValue(value?: number): string {
  if (value === undefined || value === 0) {
    return '#9e9e9e';
  }

  if (value > 5) {
    return '#2196f3';
  }

  const valueColorMap: Record<number, string> = {
    5: '#3cbe7d',
    4: '#8fa728',
    3: '#d9d10b',
    2: '#d96c2f',
    1: '#F44336',
  };

  return valueColorMap[value] || '#9e9e9e';
}

export function getIdentifierChartColor(index: number): string {
  return IDENTIFIER_CHART_COLORS[index % IDENTIFIER_CHART_COLORS.length];
}
