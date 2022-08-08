export const getText = (value?: string | number) => {
  if (typeof value === 'number') return String(value);

  if (typeof value === 'string') return value;

  return '-';
};
