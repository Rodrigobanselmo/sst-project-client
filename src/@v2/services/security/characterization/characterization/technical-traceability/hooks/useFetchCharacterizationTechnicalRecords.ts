import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseCharacterizationTechnicalRecords } from '../service/technical-traceability.service';
import type { BrowseCharacterizationTechnicalRecordsParams } from '../service/technical-traceability.types';

export const useFetchCharacterizationTechnicalRecords = (
  params: BrowseCharacterizationTechnicalRecordsParams,
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => browseCharacterizationTechnicalRecords(params),
    queryKey: [
      QueryKeyCharacterizationEnum.TECHNICAL_RECORDS,
      params.companyId,
      params.workspaceId,
      params.characterizationId,
    ],
    enabled: options?.enabled ?? true,
    refetchOnMount: true,
  });

  return {
    ...response,
    records: data || [],
  };
};
