/**
 * Extrai IDs do retorno do SMenuSearch (item único ou lista no CONFIRMAR).
 */
export function extractSelectedCatalogIds(options: unknown): string[] {
  if (Array.isArray(options)) {
    const ids = options
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return String(item).trim();
        }
        if (item && typeof item === 'object' && 'id' in item) {
          const id = (item as { id?: unknown }).id;
          return id == null ? '' : String(id).trim();
        }
        return '';
      })
      .filter(Boolean);
    return [...new Set(ids)];
  }

  if (options && typeof options === 'object' && 'id' in options) {
    const id = (options as { id?: unknown }).id;
    if (id == null || id === '') return [];
    return [String(id)];
  }

  return [];
}

/**
 * Remove IDs já vinculados. O upsert continua recebendo só os novos;
 * onHandleSelectSave mescla com os vínculos atuais (obrigatório: adms/recs/
 * generateSources substituem o conjunto no backend).
 */
export function excludeAlreadyLinkedIds(
  selectedIds: string[],
  alreadyLinkedIds: Array<string | number | null | undefined>,
): string[] {
  const linked = new Set(
    alreadyLinkedIds
      .map((id) => (id == null ? '' : String(id)))
      .filter(Boolean),
  );
  return selectedIds.filter((id) => !linked.has(id));
}

export function resolveNewCatalogIds(
  options: unknown,
  alreadyLinkedIds: Array<string | number | null | undefined>,
): string[] {
  return excludeAlreadyLinkedIds(
    extractSelectedCatalogIds(options),
    alreadyLinkedIds,
  );
}
