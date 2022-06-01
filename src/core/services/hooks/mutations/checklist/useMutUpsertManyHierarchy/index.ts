import { useMutation } from 'react-query';

import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface IUpsertHierarchy {
  id?: string;
  status?: StatusEnum;
  type?: HierarchyEnum;
  name?: string;
  companyId?: string;
  parentId?: string | null;
  workspaceIds?: string[];
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
    ApiRoutesEnum.HIERARCHY + '/upsert-many',
    sendData,
  );

  return response.data;
}

export function useMutUpsertManyHierarchy() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const company =
    (user && ((router.query.companyId as string) || user?.companyId)) ||
    undefined;

  return useMutation(
    async (data: IUpsertHierarchy[]) => {
      const upsertData = data.map((hierarchy) => {
        const queryHierarchy = queryClient.getQueryData<
          Record<string, IHierarchy>
        >([QueryEnum.HIERARCHY, company]);

        const oldHierarchy = (queryHierarchy &&
          hierarchy.id &&
          queryHierarchy[hierarchy.id]) || {
          name: '',
          type: HierarchyEnum.DIRECTORY,
        };

        return {
          ...oldHierarchy,
          ...hierarchy,
          name: hierarchy.name || oldHierarchy.name,
          type: hierarchy.type || oldHierarchy.type,
          parentId:
            hierarchy.parentId === null
              ? null
              : hierarchy.parentId
              ? hierarchy.parentId
              : undefined,
        };
      });

      return upsertManyHierarchy(upsertData, company);
    },
    {
      onSuccess: async (resp) => {
        if (!company) {
          enqueueSnackbar('ID da empresa não encontrado', {
            variant: 'error',
          });

          return;
        }

        if (resp) queryClient.refetchQueries([QueryEnum.HIERARCHY, company]);

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
