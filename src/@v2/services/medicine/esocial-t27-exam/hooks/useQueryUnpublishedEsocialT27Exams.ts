import { useQuery } from 'react-query';

import {
  searchUnpublishedEsocialT27Exams,
  IEsocialT27SearchItem,
} from '@v2/services/medicine/esocial-t27-exam/esocial-t27-exam.service';
import { ExamOriginSourceEnum, IExam } from 'core/interfaces/api/IExam';

const ESOCIAL_T27_SEARCH_MIN_LENGTH = 3;

export function useQueryUnpublishedEsocialT27Exams(
  search: string,
  enabled = true,
) {
  const trimmed = search.trim();
  const canSearch = enabled && trimmed.length >= ESOCIAL_T27_SEARCH_MIN_LENGTH;

  return useQuery(
    ['esocial-t27-unpublished', trimmed],
    () =>
      searchUnpublishedEsocialT27Exams({
        search: trimmed,
        limit: 15,
      }),
    {
      enabled: canSearch,
      staleTime: 60_000,
      keepPreviousData: true,
    },
  );
}

export const isEsocialT27UnpublishedOption = (
  option: { isEsocialT27Unpublished?: boolean } | null | undefined,
): option is { isEsocialT27Unpublished: true; esocial27Code: string; name: string } =>
  Boolean(option?.isEsocialT27Unpublished);

export const mapEsocialT27CandidateToOption = (item: IEsocialT27SearchItem) => ({
  id: -Number.parseInt(item.code, 10),
  name: item.name,
  esocial27Code: item.code,
  isEsocialT27Unpublished: true as const,
});

export const buildExamFromMaterializedT27 = (result: {
  examId: number;
  examName: string;
  esocial27Code: string;
}): Partial<IExam> => ({
  id: result.examId,
  name: result.examName,
  esocial27Code: result.esocial27Code,
  originSources: [ExamOriginSourceEnum.ESOCIAL_T27],
});
