import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { queryClient } from 'layouts/default/providers';
import { QueryEnum } from 'core/enums/query.enums';

/** Invalida browse V2 + detalhes legados após ações rápidas. */
export async function invalidateCharacterizationInventory(params: {
  companyId: string;
  workspaceId: string;
  characterizationId?: string;
}) {
  const { companyId, workspaceId, characterizationId } = params;

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: [QueryKeyCharacterizationEnum.CHARACTERIZATIONS, companyId],
    }),
    queryClient.invalidateQueries({
      queryKey: [QueryEnum.CHARACTERIZATIONS, companyId, workspaceId],
    }),
    queryClient.invalidateQueries({
      queryKey: [QueryEnum.GHO],
    }),
    ...(characterizationId
      ? [
          queryClient.invalidateQueries({
            queryKey: [
              QueryEnum.CHARACTERIZATION,
              companyId,
              workspaceId,
              characterizationId,
            ],
          }),
        ]
      : []),
  ]);
}

export const INACTIVE_ACTION_TOOLTIP =
  'Reative o elemento antes de alterar seus vínculos.';
