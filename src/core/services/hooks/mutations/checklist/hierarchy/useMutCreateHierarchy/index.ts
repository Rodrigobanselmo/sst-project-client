import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../../errors/types';

interface ICreateHierarchy {
  status?: StatusEnum;
  type: HierarchyEnum;
  name: string;
  companyId?: string;
  parentId?: string | null;
  workspaceIds: string[];
}

export async function createHierarchy(
  data: ICreateHierarchy,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IHierarchy>(ApiRoutesEnum.HIERARCHY, {
    ...data,
    companyId,
  });

  return response.data;
}

export function useMutCreateHierarchy() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateHierarchy) =>
      createHierarchy(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp) {
          const actualData = queryClient.getQueryData(
            // eslint-disable-next-line prettier/prettier
            [QueryEnum.HIERARCHY, resp.companyId]
          );
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.HIERARCHY, resp.companyId],
              (oldData: IHierarchy[] | undefined) =>
                oldData ? [...oldData, resp] : [resp],
            );
        }

        enqueueSnackbar('Hierarquia criado com sucesso', {
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
