import { useQuery } from 'react-query';

import {
  searchUnpublishedEsocialT27Exams,
  IEsocialT27SearchItem,
} from '@v2/services/medicine/esocial-t27-exam/esocial-t27-exam.service';

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
): option is {
  isEsocialT27Unpublished: true;
  esocial27Code: string;
  name: string;
  esocial27ProcedureName?: string;
} => Boolean(option?.isEsocialT27Unpublished);

export const mapEsocialT27CandidateToOption = (item: IEsocialT27SearchItem) => ({
  id: -Number.parseInt(item.code, 10),
  name: `${item.code} — ${item.name}`,
  esocial27Code: item.code,
  esocial27ProcedureName: item.name,
  isEsocialT27Unpublished: true as const,
});
