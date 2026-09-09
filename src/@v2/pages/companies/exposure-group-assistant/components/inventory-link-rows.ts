import type {
  InventoryLinkPreview,
  InventoryPgrImportPreview,
  InventoryPgrImportReview,
  InventoryReviewedLink,
} from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';

export type InventoryLinkRow = {
  link: InventoryLinkPreview;
  reviewed: InventoryReviewedLink | null;
};

export function toInventoryLinkRows(
  preview: InventoryPgrImportPreview,
  review: InventoryPgrImportReview | null | undefined,
): InventoryLinkRow[] {
  if (review) {
    return review.links.map((reviewed) => ({
      link: reviewed,
      reviewed,
    }));
  }

  return preview.links.map((link) => ({
    link,
    reviewed: null,
  }));
}
