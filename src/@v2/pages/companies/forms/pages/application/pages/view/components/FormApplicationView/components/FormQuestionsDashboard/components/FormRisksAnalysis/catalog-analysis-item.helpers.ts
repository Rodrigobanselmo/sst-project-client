type Item = { nome: string; catalogId?: string | null; origem: 'sistema' | 'ia'; justificativa: string };
type Content = { fontesGeradoras: Item[]; medidasEngenhariaRecomendadas: Item[]; medidasAdministrativasRecomendadas: Item[] };
export function selectCatalogAnalysisItem<T extends Content>(analysis: T, itemType: keyof Content, item: { id: string; name: string }, itemIndex?: number): T {
  const key = (name: string) => name.trim().normalize('NFKC').toLocaleLowerCase();
  if (Object.values(analysis).some(list => Array.isArray(list) && list.some((entry: Item) => entry.catalogId === item.id || key(entry.nome) === key(item.name)))) throw new Error('Este item já está selecionado.');
  const next = structuredClone(analysis);
  const entry = { nome: item.name, catalogId: item.id, origem: 'sistema' as const, selectionOrigin: 'USER' as const, justificativa: 'Selecionado manualmente do catálogo pelo responsável técnico.' };
  if (itemIndex != null) {
    if (!Number.isInteger(itemIndex) || !next[itemType][itemIndex]) throw new Error('Item não encontrado para troca.');
    next[itemType][itemIndex] = entry;
  } else next[itemType].push(entry);
  return next;
}
