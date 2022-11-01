import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface IUpdateGho {
  ids: number[];
  workspaceId: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function updateGho(data: IUpdateGho, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IGho>(
    `${ApiRoutesEnum.GHO}/hierarchy-homo/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return {
    data: response.data,
    request: {
      ...data,
      companyId,
    },
  };
}

export function useMutUpdateHierarchyGho() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateGho) => updateGho(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp?.request) {
          queryClient.invalidateQueries({
            predicate: (query) => {
              return (
                query.queryKey[0] === QueryEnum.CHARACTERIZATION &&
                !!query.queryKey[3]
              );
            },
          });

          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === QueryEnum.GHO && !!query.queryKey[2];
            },
          });
        }

        enqueueSnackbar('Editado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
