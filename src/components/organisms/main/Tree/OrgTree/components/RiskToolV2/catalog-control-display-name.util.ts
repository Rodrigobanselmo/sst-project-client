type CatalogControlName = {
  medName?: string | null;
  recName?: string | null;
};

/**
 * Nome visível do controle. Medidas usam medName e, se ele estiver vazio,
 * o texto já cadastrado em recName. Recomendações fazem o inverso.
 * Não inventa rótulo de categoria.
 */
export function catalogControlDisplayName(
  item: CatalogControlName,
  role: 'measure' | 'recommendation',
): string {
  const primary = (role === 'recommendation' ? item.recName : item.medName)?.trim() || '';
  const secondary = (role === 'recommendation' ? item.medName : item.recName)?.trim() || '';
  return primary || secondary;
}
