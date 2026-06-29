import type { IAcgihPromotionPreviewParams } from '../service/acgih-promotion-preview.types';

export const acgihPromotionPreviewQueryKeys = {
  all: () => ['acgih-promotion-preview'],
  preview: (params?: IAcgihPromotionPreviewParams) => [
    'acgih-promotion-preview',
    'preview',
    params ?? {},
  ],
};
