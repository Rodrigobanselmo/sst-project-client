import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

interface ICopyHomo {
  actualGroupId: string;
  companyId?: string;
  companyIdFrom: string;
  riskGroupId: string;
  riskGroupIdFrom: string;
  copyFromHomoGroupId: string;
  type?: HomoTypeEnum;
  workspaceId?: string;
}

export async function copyCompany(data: ICopyHomo) {
  if (!data.companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.GHO}/copy/${data.companyId}`,
    data,
  );
  return response.data;
}

export function useMutCopyHomo() {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICopyHomo) => copyCompany({ companyId, ...data }),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]);
        queryClient.invalidateQueries([QueryEnum.ENVIRONMENT]);
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATION]);

        enqueueSnackbar('Riscos copiados com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
