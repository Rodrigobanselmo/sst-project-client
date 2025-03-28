import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { api } from 'core/services/apiClient';
import { queryClient as OldQC } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';
import { queryClient } from 'layouts/default/providers';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';

export async function deleteCharacterization(
  id: string,
  companyId: string,
  workspaceId: string,
) {
  if (!companyId) return;

  const path = ApiRoutesEnum.CHARACTERIZATIONS.replace(
    ':companyId',
    companyId,
  ).replace(':workspaceId', workspaceId);

  const response = await api.delete<ICharacterization>(path + '/' + id);

  return response.data || { id };
}

export function useMutDeleteCharacterization() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, workspaceId } = useGetCompanyId();

  return useMutation(
    async (id: string) =>
      deleteCharacterization(id, companyId || '', workspaceId),
    {
      onSuccess: async (resp) => {
        if (!companyId) {
          enqueueSnackbar('ID da empresa não encontrado', {
            variant: 'error',
          });

          return;
        }

        if (resp) {
          const actualData = OldQC.getQueryData([
            QueryEnum.CHARACTERIZATIONS,
            resp.companyId,
            resp.workspaceId,
          ]);

          if (actualData) {
            queryClient.invalidateQueries({
              queryKey: [QueryKeyCharacterizationEnum.CHARACTERIZATIONS],
            });
            OldQC.setQueryData(
              [QueryEnum.CHARACTERIZATIONS, resp.companyId, resp.workspaceId],
              (oldData: ICharacterization[] | undefined) => {
                if (!oldData) return [];

                if (resp.profileParentId) {
                  return oldData.map((char) => {
                    if (char.id !== resp.profileParentId) {
                      return char;
                    }

                    char.profiles = char.profiles.filter(
                      (data) => data.id !== resp.id,
                    );

                    return char;
                  });
                }

                return oldData.filter((data) => data.id !== resp.id);
              },
            );

            OldQC.setQueryData(
              [QueryEnum.GHO, resp.companyId],
              (oldData: ICharacterization[] | undefined) => {
                if (!oldData) return [];

                return oldData.filter(
                  (data) =>
                    data.id !== resp.id &&
                    !resp.profiles
                      ?.map((profile) => profile.id)
                      ?.includes(data.id),
                );
              },
            );
          }

          if (resp.profileParentId)
            OldQC.invalidateQueries([
              QueryEnum.CHARACTERIZATION,
              resp.companyId,
              resp.workspaceId,
              // resp.profileParentId,
            ]);
        }

        enqueueSnackbar('Ambiente de trabalho deletado com sucesso', {
          variant: 'success',
        });

        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
