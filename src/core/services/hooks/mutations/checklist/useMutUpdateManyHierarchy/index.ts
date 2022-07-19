import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

interface IUpsertHierarchy {
  id?: string;
  refName?: string;
}

export async function upsertManyHierarchy(
  data: IUpsertHierarchy[],
  companyId?: string,
) {
  if (!companyId) return null;

  const sendData = {
    data: data.map((item) => ({ ...item, companyId })),
  };

  const response = await api.post<IHierarchy[]>(
    ApiRoutesEnum.HIERARCHY + '/simple-update-many' + `/${companyId}`,
    sendData,
  );

  return response.data;
}

export function useMutUpdateSimpleManyHierarchy() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpsertHierarchy[]) => {
      const upsertData = data.map((hierarchy) => {
        const queryHierarchy = queryClient.getQueryData<
          Record<string, IHierarchy>
        >([QueryEnum.HIERARCHY, companyId]);

        const oldHierarchy = (queryHierarchy &&
          hierarchy.id &&
          queryHierarchy[hierarchy.id]) || {
          name: '',
          type: HierarchyEnum.DIRECTORY,
        };

        return {
          ...oldHierarchy,
          ...hierarchy,
        };
      });

      return upsertManyHierarchy(upsertData, companyId);
    },
    {
      onSuccess: async (resp) => {
        if (!companyId) {
          enqueueSnackbar('ID da empresa não encontrado', {
            variant: 'error',
          });

          return;
        }

        if (resp) queryClient.refetchQueries([QueryEnum.HIERARCHY, companyId]);

        enqueueSnackbar('Editado com sucesso', {
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
