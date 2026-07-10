export function stringNormalize(string?: string | null) {
  return String(string ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
