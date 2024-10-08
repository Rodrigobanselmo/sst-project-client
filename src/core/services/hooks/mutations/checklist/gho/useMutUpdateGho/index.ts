import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateGho extends Partial<Pick<IGho, 'name' | 'status'>> {
  id: string;
  hierarchies?: { id: string; workspaceId: string }[];
  workspaceIds?: string[];
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function updateGho(data: IUpdateGho, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<IGho>(`${ApiRoutesEnum.GHO}/${data.id}`, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutUpdateGho() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateGho) => updateGho(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === QueryEnum.GHO && !!query.queryKey[2];
            },
          });

          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.GHO, resp.companyId],
          );
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.GHO, resp.companyId],
              (oldData: IGho[] | undefined) =>
                oldData
                  ? oldData.map((gho) =>
                      gho.id == resp.id
                        ? {
                            ...gho,
                            ...resp,
                          }
                        : gho,
                    )
                  : [],
            );
        }

        enqueueSnackbar('Grupo homogênio de exposição editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, {
            variant: 'error',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
      },
    },
  );
}
