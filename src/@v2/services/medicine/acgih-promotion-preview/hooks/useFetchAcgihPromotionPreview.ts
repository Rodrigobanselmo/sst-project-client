import { useFetch } from '@v2/hooks/api/useFetch';

import { getAcgihPromotionPreview } from '../service/acgih-promotion-preview.service';
import type { IAcgihPromotionPreviewParams } from '../service/acgih-promotion-preview.types';
import { acgihPromotionPreviewQueryKeys } from './acgih-promotion-preview.query-keys';

export const useFetchAcgihPromotionPreview = (
  params: IAcgihPromotionPreviewParams,
  enabled = true,
) =>
  useFetch({
    queryKey: acgihPromotionPreviewQueryKeys.preview(params),
    queryFn: () => getAcgihPromotionPreview(params),
    enabled,
    refetchOnMount: true,
  });
