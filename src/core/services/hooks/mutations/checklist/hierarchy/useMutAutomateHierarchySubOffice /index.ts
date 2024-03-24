import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { api } from 'core/services/apiClient';
import { setMapHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

interface IAutomateHierarchySubOffice {
  id?: string;
  name: string;
  realDescription?: string;
  status?: StatusEnum;
  companyId?: string;
  employeesIds: number[];
  parentId?: string;
}

export async function automateHierarchySubOffice(
  data: IAutomateHierarchySubOffice,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IHierarchy>(
    `${ApiRoutesEnum.HIERARCHY}/sub-office/${companyId}`,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutAutomateHierarchySubOffice() {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IAutomateHierarchySubOffice) =>
      automateHierarchySubOffice(data, data.companyId || companyId),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.HIERARCHY]);

        enqueueSnackbar('Cargo desenvolvido criado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        console.error(error);
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
