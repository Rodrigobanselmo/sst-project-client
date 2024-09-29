export function stringToNumber(value: string): number | undefined {
  const isNumber = !isNaN(Number(value));
  if (isNumber) return Number(value);

  return undefined;
}
