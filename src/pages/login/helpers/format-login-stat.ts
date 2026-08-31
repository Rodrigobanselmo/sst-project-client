export function formatLoginStat(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '';

  const amount = Math.floor(value);

  if (amount < 1_000) {
    return `+${amount}`;
  }

  if (amount < 1_000_000) {
    return `+${Math.floor(amount / 1_000)} mil`;
  }

  const tenthsOfMillion = Math.floor(amount / 100_000);
  if (tenthsOfMillion % 10 === 0) {
    return `+${tenthsOfMillion / 10} mi`;
  }

  return `+${(tenthsOfMillion / 10).toFixed(1).replace('.', ',')} mi`;
}
