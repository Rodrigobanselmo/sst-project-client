import { BiologicalIndicatorRoutes } from '@v2/constants/routes/biological-indicator.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  BiologicalIndicatorDetail,
  BiologicalIndicatorExamLink,
  BiologicalIndicatorRiskLink,
  BrowseBiologicalIndicatorsParams,
  BrowseBiologicalIndicatorsResponse,
  CreateExamLinkParams,
  CurationNotesParams,
  ExamCandidate,
  SearchExamCandidatesParams,
  UpdateIndicatorStatusParams,
} from './biological-indicator.types';

export async function browseBiologicalIndicators(
  params: BrowseBiologicalIndicatorsParams,
): Promise<BrowseBiologicalIndicatorsResponse> {
  const response = await api.get<BrowseBiologicalIndicatorsResponse>(
    BiologicalIndicatorRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function getBiologicalIndicatorById(
  id: string,
): Promise<BiologicalIndicatorDetail> {
  const response = await api.get<BiologicalIndicatorDetail>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.BY_ID,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function getBiologicalIndicatorPendencies(id: string) {
  const response = await api.get<{
    indicatorId: string;
    pendencies: Array<{ code: string; message: string }>;
    canActivate: boolean;
  }>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.PENDENCIES,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function updateBiologicalIndicatorStatus({
  indicatorId,
  status,
  reviewNotes,
}: UpdateIndicatorStatusParams) {
  const response = await api.patch(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.STATUS,
      pathParams: { id: indicatorId },
    }),
    { status, reviewNotes },
  );
  return response.data;
}

export async function listBiologicalIndicatorRiskLinks(
  indicatorId: string,
): Promise<BiologicalIndicatorRiskLink[]> {
  const response = await api.get<BiologicalIndicatorRiskLink[]>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.RISK_LINKS,
      pathParams: { id: indicatorId },
    }),
  );
  return response.data;
}

export async function confirmBiologicalIndicatorRiskLink({
  linkId,
  notes,
}: CurationNotesParams) {
  const response = await api.patch<BiologicalIndicatorRiskLink>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.RISK_LINK_CONFIRM,
      pathParams: { id: linkId },
    }),
    { notes },
  );
  return response.data;
}

export async function rejectBiologicalIndicatorRiskLink({
  linkId,
  notes,
}: CurationNotesParams) {
  const response = await api.patch(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.RISK_LINK_REJECT,
      pathParams: { id: linkId },
    }),
    { notes },
  );
  return response.data;
}

export async function setPrimaryBiologicalIndicatorRiskLink(linkId: string) {
  const response = await api.patch<BiologicalIndicatorRiskLink>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.RISK_LINK_PRIMARY,
      pathParams: { id: linkId },
    }),
  );
  return response.data;
}

export async function listBiologicalIndicatorExamLinks(
  indicatorId: string,
): Promise<BiologicalIndicatorExamLink[]> {
  const response = await api.get<BiologicalIndicatorExamLink[]>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.EXAM_LINKS,
      pathParams: { id: indicatorId },
    }),
  );
  return response.data;
}

export async function createBiologicalIndicatorExamLink({
  indicatorId,
  examId,
  notes,
}: CreateExamLinkParams) {
  const response = await api.post<BiologicalIndicatorExamLink>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.EXAM_LINKS,
      pathParams: { id: indicatorId },
    }),
    { examId, notes },
  );
  return response.data;
}

export async function confirmBiologicalIndicatorExamLink({
  linkId,
  notes,
}: CurationNotesParams) {
  const response = await api.patch<BiologicalIndicatorExamLink>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.EXAM_LINK_CONFIRM,
      pathParams: { id: linkId },
    }),
    { notes },
  );
  return response.data;
}

export async function rejectBiologicalIndicatorExamLink({
  linkId,
  notes,
}: CurationNotesParams) {
  const response = await api.patch(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.EXAM_LINK_REJECT,
      pathParams: { id: linkId },
    }),
    { notes },
  );
  return response.data;
}

export async function setDefaultBiologicalIndicatorExamLink(linkId: string) {
  const response = await api.patch<BiologicalIndicatorExamLink>(
    bindUrlParams({
      path: BiologicalIndicatorRoutes.EXAM_LINK_DEFAULT,
      pathParams: { id: linkId },
    }),
  );
  return response.data;
}

export async function searchBiologicalIndicatorExamCandidates(
  params: SearchExamCandidatesParams,
): Promise<ExamCandidate[]> {
  const response = await api.get<ExamCandidate[]>(
    BiologicalIndicatorRoutes.EXAM_CANDIDATES,
    { params },
  );
  return response.data;
}
