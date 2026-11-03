import { useMutation } from 'react-query';
import { useSnackbar } from 'notistack';
import { isSstMutationCancelled } from '@v2/features/sst-operational/mutation-decision';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { CharacterizationHierarchySelection } from 'components/organisms/modals/ModalAddCharacterization/hooks/commit-characterization-hierarchy-selection';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { queryClient as v2QueryClient } from 'layouts/default/providers';

export type CharacterizationHierarchySelectionResult = {
  id: string;
  addedLinkIds: number[];
  endedLinkIds: number[];
  removedLinkIds: number[];
  unchangedLinkIds: number[];
};

type SelectCharacterizationHierarchies = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  selection: CharacterizationHierarchySelection;
};

export async function selectCharacterizationHierarchies(
  params: SelectCharacterizationHierarchies,
) {
  const path = ApiRoutesEnum.CHARACTERIZATIONS.replace(
    ':companyId',
    params.companyId,
  ).replace(':workspaceId', params.workspaceId);
  const response = await api.post<CharacterizationHierarchySelectionResult>(
    `${path}/${params.characterizationId}/hierarchy-selection`,
    params.selection,
  );
  return response.data;
}

export function useMutSelectCharacterizationHierarchies() {
  const { enqueueSnackbar } = useSnackbar();
  return useMutation(selectCharacterizationHierarchies, {
    onSuccess: async (_result, { companyId, workspaceId }) => {
      await Promise.all([
        queryClient.invalidateQueries([
          QueryEnum.CHARACTERIZATION,
          companyId,
          workspaceId,
        ]),
        queryClient.invalidateQueries([
          QueryEnum.CHARACTERIZATIONS,
          companyId,
          workspaceId,
        ]),
        queryClient.invalidateQueries([QueryEnum.GHO]),
        v2QueryClient.invalidateQueries({
          queryKey: [QueryKeyCharacterizationEnum.CHARACTERIZATIONS, companyId],
        }),
      ]);
    },
    onError: (error: unknown) => {
      if (isSstMutationCancelled(error)) return;
      const response = (
        error as {
          response?: { data?: { code?: string; message?: string | string[] } };
        }
      )?.response?.data;
      const message =
        response?.code === 'SST_CHARACTERIZATION_SELECTION_CONFLICT'
          ? 'Os vínculos mudaram enquanto você selecionava. Sua seleção foi mantida. Volte e abra a seleção novamente para conferir os dados atualizados.'
          : response?.message ||
            (error instanceof Error
              ? error.message
              : 'Não foi possível salvar a seleção de cargos.');
      enqueueSnackbar(Array.isArray(message) ? message.join(' ') : message, {
        variant: 'error',
      });
    },
  });
}
