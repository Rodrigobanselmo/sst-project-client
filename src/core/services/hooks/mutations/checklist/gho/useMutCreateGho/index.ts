import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface ICreateGho extends Partial<Pick<IGho, 'name' | 'status'>> {
  id?: number;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  hierarchies?: { id: string; workspaceId: string }[];
}

export async function createGho(data: ICreateGho, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IGho>(ApiRoutesEnum.GHO, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateGho() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: ICreateGho) => createGho(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries({
            predicate: (query) => {
              return query.queryKey[0] === QueryEnum.GHO && !!query.queryKey[2];
            },
          });

          // eslint-disable-next-line prettier/prettier
          const actualData = queryClient.getQueryData<IGho[]>([QueryEnum.GHO, resp.companyId]);
          if (actualData) {
            if (!actualData.length)
              queryClient.invalidateQueries([
                QueryEnum.COMPANY,
                resp.companyId,
              ]);

            queryClient.setQueryData(
              [QueryEnum.GHO, resp.companyId],
              (oldData: IGho[] | undefined) =>
                oldData ? [...oldData, resp] : [resp],
            );
          }
        }
        enqueueSnackbar('Grupo homogênio de exposição criado com sucesso', {
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
