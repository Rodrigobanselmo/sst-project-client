import type { CatalogDecision, CatalogPreview } from './catalog-review-model';

export type CatalogDecisionRequest = {
  companyId?: string;
  preview: CatalogPreview;
  apply: (decision: CatalogDecision) => Promise<unknown>;
  resolve: (result: unknown) => void;
  reject: (error: Error) => void;
};

export function askCatalogDecision<T>(
  preview: CatalogPreview,
  apply: (decision: CatalogDecision) => Promise<T>,
  companyId?: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined')
      return reject(
        new Error('A alteração exige revisão dos usos do catálogo.'),
      );
    window.dispatchEvent(
      new CustomEvent('sst-catalog-decision', {
        detail: { preview, apply, resolve, reject, companyId },
      }),
    );
  });
}
