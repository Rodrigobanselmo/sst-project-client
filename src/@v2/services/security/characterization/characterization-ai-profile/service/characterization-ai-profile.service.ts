import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

import {
  CharacterizationAiProfileBrowseResult,
  CharacterizationAiProfileDraftDto,
  CharacterizationAiProfileDto,
  CharacterizationAiProfileSummaryBrowseResult,
  CharacterizationAiProfileTranscribeResult,
  CreateCharacterizationAiProfilePayload,
  GenerateCharacterizationAiProfileDraftPayload,
  UpdateCharacterizationAiProfilePayload,
} from './characterization-ai-profile.types';

type CompanyParams = { companyId: string };

export async function browseCharacterizationAiProfiles(
  params: CompanyParams & {
    search?: string;
    isActive?: 'all' | 'true' | 'false';
    page?: number;
    limit?: number;
  },
) {
  const { companyId, ...query } = params;
  const response = await api.get<CharacterizationAiProfileSummaryBrowseResult>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.BROWSE,
      pathParams: { companyId },
    }),
    {
      params: {
        search: query.search || undefined,
        // Summary browse is for Assistente / common users — active only by default.
        isActive: query.isActive ?? 'true',
        page: query.page ?? 1,
        limit: query.limit ?? 50,
      },
    },
  );
  return response.data;
}

export async function browseCharacterizationAiProfilesAdmin(
  params: CompanyParams & {
    search?: string;
    isActive?: 'all' | 'true' | 'false';
    page?: number;
    limit?: number;
  },
) {
  const { companyId, ...query } = params;
  const response = await api.get<CharacterizationAiProfileBrowseResult>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.ADMIN_BROWSE,
      pathParams: { companyId },
    }),
    {
      params: {
        search: query.search || undefined,
        isActive: query.isActive ?? 'all',
        page: query.page ?? 1,
        limit: query.limit ?? 50,
      },
    },
  );
  return response.data;
}

export async function readCharacterizationAiProfile(
  params: CompanyParams & { profileId: string },
) {
  const response = await api.get<CharacterizationAiProfileDto>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.READ,
      pathParams: params,
    }),
  );
  return response.data;
}

export async function createCharacterizationAiProfile(
  params: CompanyParams & CreateCharacterizationAiProfilePayload,
) {
  const { companyId, ...body } = params;
  const response = await api.post<CharacterizationAiProfileDto>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.BROWSE,
      pathParams: { companyId },
    }),
    body,
  );
  return response.data;
}

export async function updateCharacterizationAiProfile(
  params: CompanyParams & {
    profileId: string;
  } & UpdateCharacterizationAiProfilePayload,
) {
  const { companyId, profileId, ...body } = params;
  const response = await api.put<CharacterizationAiProfileDto>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.READ,
      pathParams: { companyId, profileId },
    }),
    body,
  );
  return response.data;
}

export async function duplicateCharacterizationAiProfile(
  params: CompanyParams & { profileId: string; name?: string },
) {
  const { companyId, profileId, name } = params;
  const response = await api.post<CharacterizationAiProfileDto>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.DUPLICATE,
      pathParams: { companyId, profileId },
    }),
    name ? { name } : {},
  );
  return response.data;
}

export async function setCharacterizationAiProfileStatus(
  params: CompanyParams & { profileId: string; isActive: boolean },
) {
  const { companyId, profileId, isActive } = params;
  const response = await api.patch<CharacterizationAiProfileDto>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.STATUS,
      pathParams: { companyId, profileId },
    }),
    { isActive },
  );
  return response.data;
}

export async function setCharacterizationAiProfileDefault(
  params: CompanyParams & { profileId: string | null },
) {
  const { companyId, profileId } = params;
  const response = await api.put<{ profileId: string | null }>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.DEFAULT,
      pathParams: { companyId },
    }),
    { profileId },
  );
  return response.data;
}

export async function setCharacterizationAiProfileTypeDefault(
  params: CompanyParams & {
    type: CharacterizationTypeEnum;
    profileId: string | null;
  },
) {
  const { companyId, type, profileId } = params;
  const response = await api.put<{ profileId: string | null }>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.TYPE_DEFAULT,
      pathParams: { companyId, type },
    }),
    { profileId },
  );
  return response.data;
}

export async function transcribeCharacterizationAiProfileAudio(
  params: CompanyParams & { audio: Blob; fileName?: string },
) {
  const formData = new FormData();
  formData.append('audio', params.audio, params.fileName ?? 'recording.webm');
  const response = await api.post<CharacterizationAiProfileTranscribeResult>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.TRANSCRIBE,
      pathParams: { companyId: params.companyId },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return response.data;
}

export async function generateCharacterizationAiProfileDraft(
  params: CompanyParams & GenerateCharacterizationAiProfileDraftPayload,
) {
  const { companyId, ...body } = params;
  const response = await api.post<CharacterizationAiProfileDraftDto>(
    bindUrlParams({
      path: CharacterizationRoutes.AI_PROFILE.DRAFT,
      pathParams: { companyId },
    }),
    body,
  );
  return response.data;
}
