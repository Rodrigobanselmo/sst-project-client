/**
 * Builds sequential captions from a shared base label.
 * With base "Casa de máquinas" → "Casa de máquinas — Foto 1", ...
 * With empty base → "Foto 1", "Foto 2", ...
 */
export function buildSequentialPhotoCaptions(
  baseCaption: string,
  count: number,
): string[] {
  const base = baseCaption.trim();

  return Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    return base ? `${base} — Foto ${number}` : `Foto ${number}`;
  });
}
