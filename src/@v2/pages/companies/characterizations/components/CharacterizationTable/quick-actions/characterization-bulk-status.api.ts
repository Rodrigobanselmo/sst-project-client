import { api } from 'core/services/apiClient';

import {
  buildCharacterizationBulkStatusPath,
  buildCharacterizationBulkStatusPayload,
} from './characterization-bulk-status.util';

export type BulkCharacterizationStatusItemResult =
  | 'UPDATED'
  | 'ALREADY_IN_STATUS'
  | 'BLOCKED'
  | 'IGNORED';

export type BulkUpdateCharacterizationStatusResponse = {
  requestedElements: number;
  eligibleElements: number;
  updatedElements: number;
  alreadyInTargetStatus: number;
  blockedElements: number;
  ignoredElements: number;
  items: Array<{
    characterizationId: string;
    name: string;
    result: BulkCharacterizationStatusItemResult;
    reason?: string;
  }>;
  dryRun: boolean;
};

export async function bulkUpdateCharacterizationStatus(params: {
  companyId: string;
  workspaceId: string;
  characterizationIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
  confirm?: boolean;
}): Promise<BulkUpdateCharacterizationStatusResponse> {
  const { companyId, workspaceId, characterizationIds, status, confirm } =
    params;

  const response = await api.post<BulkUpdateCharacterizationStatusResponse>(
    buildCharacterizationBulkStatusPath(companyId, workspaceId),
    buildCharacterizationBulkStatusPayload({
      characterizationIds,
      status,
      confirm,
    }),
  );

  return response.data;
}
