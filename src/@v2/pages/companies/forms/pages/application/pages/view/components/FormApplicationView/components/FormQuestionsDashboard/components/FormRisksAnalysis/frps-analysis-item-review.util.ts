import type { FormAiAnalysisItemReviewModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export type FrpsAnalysisItemType =
  | 'fontesGeradoras'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

const ITEM_KIND = {
  fontesGeradoras: 'SOURCE',
  medidasEngenhariaRecomendadas: 'ENGINEERING_RECOMMENDATION',
  medidasAdministrativasRecomendadas: 'ADMINISTRATIVE_RECOMMENDATION',
} as const;

export function resolveAnalysisItemAnchor(
  item: { reviewItemId?: string | null; catalogId?: string | null } | null | undefined,
  itemType: FrpsAnalysisItemType,
): string | null {
  const reviewItemId = item?.reviewItemId?.trim();
  if (reviewItemId) return `review:${reviewItemId}`;

  const catalogId = item?.catalogId?.trim();
  if (catalogId) return `catalog:${ITEM_KIND[itemType]}:${catalogId}`;

  return null;
}

export function findAnalysisItemReview(
  reviews: FormAiAnalysisItemReviewModel[] | null | undefined,
  item: { reviewItemId?: string | null; catalogId?: string | null },
  itemType: FrpsAnalysisItemType,
): FormAiAnalysisItemReviewModel | undefined {
  const anchor = resolveAnalysisItemAnchor(item, itemType);
  if (!anchor) return undefined;
  const kind = ITEM_KIND[itemType];
  return reviews?.find(
    (review) => review.itemKind === kind && review.itemAnchor === anchor,
  );
}
