import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import type {
  BrowseCharacterizationTechnicalRecordsParams,
  CharacterizationFinalSnapshot,
  CharacterizationTechnicalRecordItem,
  CharacterizationTechnicalRecordMutationParams,
  DeleteCharacterizationTechnicalRecordParams,
} from './technical-traceability.types';

export async function browseCharacterizationTechnicalRecords(
  params: BrowseCharacterizationTechnicalRecordsParams,
): Promise<CharacterizationTechnicalRecordItem[]> {
  const response = await api.get(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.TECHNICAL_RECORDS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        characterizationId: params.characterizationId,
      },
    }),
  );

  return response.data;
}

export async function createCharacterizationTechnicalRecord({
  companyId,
  workspaceId,
  characterizationId,
  ...body
}: CharacterizationTechnicalRecordMutationParams) {
  const response = await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.TECHNICAL_RECORDS,
      pathParams: { companyId, workspaceId, characterizationId },
    }),
    body,
  );

  return response.data as CharacterizationTechnicalRecordItem;
}

export async function updateCharacterizationTechnicalRecord({
  companyId,
  workspaceId,
  characterizationId,
  recordId,
  ...body
}: CharacterizationTechnicalRecordMutationParams & { recordId: string }) {
  const response = await api.patch(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.TECHNICAL_RECORD,
      pathParams: { companyId, workspaceId, characterizationId, recordId },
    }),
    body,
  );

  return response.data as CharacterizationTechnicalRecordItem;
}

export async function deleteOrArchiveCharacterizationTechnicalRecord({
  companyId,
  workspaceId,
  characterizationId,
  recordId,
}: DeleteCharacterizationTechnicalRecordParams) {
  const response = await api.delete(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.TECHNICAL_RECORD,
      pathParams: { companyId, workspaceId, characterizationId, recordId },
    }),
  );

  return response.data as {
    id: string;
    action: 'DELETED' | 'ARCHIVED';
    status?: string;
  };
}

export async function captureCharacterizationTechnicalSnapshot(
  params: BrowseCharacterizationTechnicalRecordsParams,
): Promise<CharacterizationFinalSnapshot> {
  const response = await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION
        .TECHNICAL_RECORD_CAPTURE_SNAPSHOT,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        characterizationId: params.characterizationId,
      },
    }),
  );

  return response.data;
}
