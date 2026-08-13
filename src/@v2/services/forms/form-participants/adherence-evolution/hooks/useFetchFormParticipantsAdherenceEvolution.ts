import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { readFormParticipantsAdherenceEvolution } from '../service/read-form-participants-adherence-evolution.service';
import { ReadFormParticipantsAdherenceEvolutionParams } from '../service/read-form-participants-adherence-evolution.types';

export const getKeyFormParticipantsAdherenceEvolution = (
  params: ReadFormParticipantsAdherenceEvolutionParams,
) => {
  return [
    QueryKeyFormEnum.FORM_PARTICIPANTS_ADHERENCE_EVOLUTION,
    params.companyId,
    params.applicationId,
    params.filters?.search ?? null,
    params.filters?.hierarchyIds ?? [],
    params.filters?.workspaceIds ?? [],
  ];
};

export const useFetchFormParticipantsAdherenceEvolution = (
  params: ReadFormParticipantsAdherenceEvolutionParams & { enabled?: boolean },
) => {
  const { enabled = true, ...rest } = params;
  const { data, ...response } = useFetch({
    queryFn: async () => readFormParticipantsAdherenceEvolution(rest),
    queryKey: getKeyFormParticipantsAdherenceEvolution(rest),
    enabled: !!rest.companyId && !!rest.applicationId && enabled,
  });

  return {
    ...response,
    evolution: data,
  };
};
