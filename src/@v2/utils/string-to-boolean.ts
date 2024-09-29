export function stringToBoolean(value: string): boolean | undefined {
  const valueLower = value.toLocaleLowerCase();

  const isTrue = valueLower === 'true';
  if (isTrue) return true;

  const isFalse = valueLower === 'false';
  if (isFalse) return false;

  return undefined;
}
