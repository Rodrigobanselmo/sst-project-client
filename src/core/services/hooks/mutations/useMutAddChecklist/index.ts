import { useMutation } from 'react-query';

import { TreeTypeEnum } from 'components/main/OrgTree/enums/tree-type.enums';
import { useSnackbar } from 'notistack';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { QueryEnum } from 'core/enums/query.enums';
import { IChecklist } from 'core/interfaces/api/IChecklist';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../contexts/AuthContext';
import { IErrorResp } from '../../../errors/types';

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

  const response = await api.post<IChecklist>('/checklist', {
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

        if (resp)
          queryClient.setQueryData(
            [QueryEnum.CHECKLIST, resp.companyId],
            (oldData: IChecklist[] | undefined) =>
              oldData ? [resp, ...oldData] : [resp],
          );

        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
