import { useMutation } from 'react-query';

import { TreeTypeEnum } from 'components/organisms/main/Tree/ChecklistTree/enums/tree-type.enums';
import { useSnackbar } from 'notistack';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { IChecklist } from 'core/interfaces/api/IChecklist';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../../errors/types';

interface ICreateChecklistData extends Pick<IChecklist, 'name' | 'status'> {
  companyId?: string;
}

export async function createNewChecklist(
  data: ICreateChecklistData,
  companyId?: string,
) {
  if (!companyId) return null;

  const json = {
    [firstNodeId]: {
      id: firstNodeId,
      childrenIds: [],
      type: TreeTypeEnum.CHECKLIST,
      label: data.name,
      parentId: null,
      expand: false,
    },
  };

  const response = await api.post<IChecklist>(ApiRoutesEnum.CHECKLIST, {
    ...data,
    companyId,
    data: {
      json: JSON.stringify(json),
    },
  });

  return response.data;
}

export function useMutAddChecklist() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateChecklistData) =>
      createNewChecklist(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        enqueueSnackbar('Novo checklist criado', { variant: 'success' });

        if (resp) {
          // eslint-disable-next-line prettier/prettier
          const actualData = queryClient.getQueryData([QueryEnum.CHECKLIST, resp.companyId]);
          if (actualData)
            queryClient.setQueryData(
              [QueryEnum.CHECKLIST, resp.companyId],
              (oldData: IChecklist[] | undefined) =>
                oldData ? [resp, ...oldData] : [resp],
            );
        }

        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
