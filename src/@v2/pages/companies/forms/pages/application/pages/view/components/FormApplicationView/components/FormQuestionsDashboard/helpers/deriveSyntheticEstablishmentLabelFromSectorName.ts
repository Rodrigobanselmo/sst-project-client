const SECTOR_TYPE_PREFIXES = [
  'OPERACIONAL',
  'ADMINISTRATIVO',
  'SETOR',
  'AREA',
  'ÁREA',
] as const;

/**
 * Label sintético de estabelecimento quando não há workspace canônico no payload.
 * Remove prefixos estruturais do nome do setor (ex.: OPERACIONAL).
 */
export function deriveSyntheticEstablishmentLabelFromSectorName(
  sectorName: string,
): string | null {
  let label = sectorName.trim();
  if (!label) return null;

  for (const prefix of SECTOR_TYPE_PREFIXES) {
    const pattern = new RegExp(`^${prefix}\\s+`, 'i');
    if (pattern.test(label)) {
      label = label.replace(pattern, '').trim();
      break;
    }
  }

  label = label.replace(/\s+/g, ' ').trim();

  return label || null;
}
