import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { ActionPlanBrowseModel } from '@v2/models/security/models/action-plan/action-plan-browse.model';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { QueryClient } from '@tanstack/react-query';

export type PatchActionPlanPlanningCacheParams = {
  companyId: string;
  workspaceId: string;
  riskDataId: string;
  recommendationId: string;
  monitoringMethod: string | null;
  resultCriteria: string | null;
};

export const getActionPlanReadQueryKey = (
  params: PatchActionPlanPlanningCacheParams,
) =>
  [
    QueryKeyActionPlanEnum.ACTION_PLAN,
    params.companyId,
    QueryKeyEnum.READ,
    {
      companyId: params.companyId,
      recommendationId: params.recommendationId,
      riskDataId: params.riskDataId,
      workspaceId: params.workspaceId,
    },
  ] as const;

export const patchActionPlanPlanningCache = (
  queryClient: QueryClient,
  params: PatchActionPlanPlanningCacheParams,
) => {
  queryClient.setQueryData<ActionPlanReadModel>(
    getActionPlanReadQueryKey(params),
    (old) => {
      if (!old) return old;

      return new ActionPlanReadModel({
        uuid: old.uuid,
        companyId: old.companyId,
        name: old.name,
        type: old.type,
        status: old.status,
        validDate: old.validDate,
        responsible: old.responsible,
        recommendation: {
          name: old.recommendation.name,
          photos: old.recommendation.photos ?? [],
        },
        generateSources: old.generateSources,
        characterizationPhotos: old.characterizationPhotos ?? [],
        planning: {
          monitoringMethod: params.monitoringMethod,
          resultCriteria: params.resultCriteria,
        },
        effectiveness: {
          status: old.effectiveness.status,
          date: old.effectiveness.date,
          comment: old.effectiveness.comment,
          evaluatedBy: old.effectiveness.evaluatedBy,
        },
      });
    },
  );

  queryClient.setQueriesData<ActionPlanBrowseModel>(
    { queryKey: [QueryKeyActionPlanEnum.ACTION_PLAN, params.companyId] },
    (old) => {
      if (!old?.results?.length) return old;

      let hasMatch = false;
      const results = old.results.map((row) => {
        if (
          row.uuid.riskDataId !== params.riskDataId ||
          row.uuid.recommendationId !== params.recommendationId ||
          row.uuid.workspaceId !== params.workspaceId
        ) {
          return row;
        }

        hasMatch = true;
        row.planning.monitoringMethod = params.monitoringMethod;
        row.planning.resultCriteria = params.resultCriteria;
        return row;
      });

      return hasMatch ? { ...old, results } : old;
    },
  );
};
