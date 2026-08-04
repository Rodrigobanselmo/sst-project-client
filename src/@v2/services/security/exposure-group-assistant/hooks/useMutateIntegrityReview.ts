import { useMutate } from '@v2/hooks/api/useMutate';

import {
  bulkJustifyIntegrityReview,
  justifyIntegrityReview,
  previewBulkJustifyIntegrityReview,
  reopenIntegrityReview,
} from '../service/exposure-group-assistant.service';
import type {
  BulkJustifyIntegrityReviewExecuteParams,
  BulkJustifyIntegrityReviewParams,
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

export function useMutatePreviewBulkJustifyIntegrityReview() {
  return useMutate({
    mutationFn: (params: BulkJustifyIntegrityReviewParams) =>
      previewBulkJustifyIntegrityReview(params),
    invalidateManyQueryKeys: () => [],
  });
}

export function useMutateBulkJustifyIntegrityReview() {
  return useMutate({
    mutationFn: (params: BulkJustifyIntegrityReviewExecuteParams) =>
      bulkJustifyIntegrityReview(params),
    invalidateManyQueryKeys: () => [[...exposureGroupAssistantQueryKeys.all]],
  });
}
