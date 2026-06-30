import { EsocialT27ExamRoutes } from '@v2/constants/routes/esocial-t27-exam.routes';
import { api } from 'core/services/apiClient';

export type IEsocialT27SearchItem = {
  code: string;
  name: string;
};

export type IEsocialT27SearchResponse = {
  items: IEsocialT27SearchItem[];
};

export type IMaterializeEsocialT27ExamPayload = {
  esocial27Code: string;
  companyId?: string;
  asSystem?: boolean;
};

export type IMaterializeEsocialT27ExamResponse = {
  examId: number;
  examName: string;
  esocial27Code: string;
  created: boolean;
  scope: 'SYSTEM' | 'COMPANY';
  warning?: string;
};

export async function searchUnpublishedEsocialT27Exams(params: {
  search: string;
  limit?: number;
}): Promise<IEsocialT27SearchResponse> {
  const response = await api.get<IEsocialT27SearchResponse>(
    EsocialT27ExamRoutes.SEARCH,
    { params },
  );
  return response.data;
}

export async function materializeEsocialT27Exam(
  payload: IMaterializeEsocialT27ExamPayload,
): Promise<IMaterializeEsocialT27ExamResponse> {
  const response = await api.post<IMaterializeEsocialT27ExamResponse>(
    EsocialT27ExamRoutes.MATERIALIZE,
    payload,
  );
  return response.data;
}
