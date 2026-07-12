import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseCharacterizationAiAssistTraces } from '../service/ai-characterization-assist-traceability.service';
import type { BrowseCharacterizationAiAssistTracesParams } from '../service/ai-characterization-assist-traceability.types';

export const useFetchCharacterizationAiAssistTraces = (
  params: BrowseCharacterizationAiAssistTracesParams,
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => browseCharacterizationAiAssistTraces(params),
    queryKey: [
      QueryKeyCharacterizationEnum.AI_CHARACTERIZATION_ASSIST_TRACES,
      params.companyId,
      params.workspaceId,
      params.characterizationId,
    ],
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
  });

  return {
    ...response,
    traces: data || [],
  };
};
