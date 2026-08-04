import { useMutate } from '@v2/hooks/api/useMutate';

import {
  justifyIntegrityReview,
  reopenIntegrityReview,
} from '../service/exposure-group-assistant.service';
import type {
  JustifyIntegrityReviewParams,
  ReopenIntegrityReviewParams,
} from '../service/exposure-group-assistant.types';
import { exposureGroupAssistantQueryKeys } from './exposure-group-assistant.query-keys';

export function useMutateJustifyIntegrityReview() {
  return useMutate({
    mutationFn: (params: JustifyIntegrityReviewParams) =>
      justifyIntegrityReview(params),
    invalidateManyQueryKeys: () => [[...exposureGroupAssistantQueryKeys.all]],
  });
}

export function useMutateReopenIntegrityReview() {
  return useMutate({
    mutationFn: (params: ReopenIntegrityReviewParams) =>
      reopenIntegrityReview(params),
    invalidateManyQueryKeys: () => [[...exposureGroupAssistantQueryKeys.all]],
  });
}
