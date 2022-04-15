import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { IChecklist } from 'core/interfaces/api/IChecklist';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface IUpdateChecklistData extends Partial<Omit<IChecklist, 'data'>> {
  data: {
    json: string;
  };
}

export async function updateNewChecklist(
  data: IUpdateChecklistData,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IChecklist>(
    `${ApiRoutesEnum.CHECKLIST}/${data.id}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateChecklist() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateChecklistData) =>
      updateNewChecklist(data, data.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.setQueryData(
            [QueryEnum.CHECKLIST, resp.companyId],
            (oldData: IChecklist[] | undefined) =>
              oldData
                ? oldData.map((checklist) =>
                    checklist.id == resp.id
                      ? {
                          ...checklist,
                          ...resp,
                          data: { ...checklist.data, ...resp.data },
                        }
                      : checklist,
                  )
                : [],
          );

        return resp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
