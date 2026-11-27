import type {
  RiskCatalogCopyItemResult,
  RiskCatalogDndDragItem,
} from './risk-catalog-dnd.types';

/** Recomendações e controles compartilham o cadastro ao colar em outro fator. */
export const sameRiskCatalogMatch = (
  item: RiskCatalogDndDragItem,
  dest: { risk: { id?: string }; recordScoped?: boolean },
): RiskCatalogCopyItemResult | null => {
  const sharedControl = ['rec', 'adm', 'eng'].includes(item.kind);
  if (item.catalogId == null || item.kind === 'epi') return null;
  if (
    !sharedControl &&
    (!dest.recordScoped || item.sourceRiskId !== dest.risk?.id)
  )
    return null;
  return {
    status: 'attach_existing',
    match: {
      id: String(item.catalogId),
      name: item.name,
      recName: item.name,
      medName: item.name,
      recType: item.recType,
      medType: item.medType,
      ...(item.catalogStatus ? { status: item.catalogStatus } : {}),
    },
  };
};
