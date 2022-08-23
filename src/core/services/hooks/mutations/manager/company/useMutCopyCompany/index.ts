import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export async function copyCompany(
  copyFromCompanyId: string,
  docId: string,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post(
    `${ApiRoutesEnum.COMPANIES}/copy/${copyFromCompanyId}/${docId}/${companyId}`,
  );
  return response.data;
}

export function useMutCopyCompany() {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({
      copyFromCompanyId,
      docId,
    }: {
      copyFromCompanyId: string;
      docId: string;
    }) => copyCompany(copyFromCompanyId, docId, companyId),
    {
      onSuccess: async () => {
        queryClient.invalidateQueries([QueryEnum.CHARACTERIZATIONS, companyId]);
        queryClient.invalidateQueries([QueryEnum.ENVIRONMENTS, companyId]);
        queryClient.invalidateQueries([QueryEnum.HIERARCHY, companyId]);
        queryClient.invalidateQueries([QueryEnum.GHO, companyId]);
        queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyId]);
        queryClient.invalidateQueries([QueryEnum.RISK_GROUP_DATA, companyId]);
        queryClient.invalidateQueries([QueryEnum.COMPANY, companyId]);

        enqueueSnackbar('Empresa copiada com sucesso', {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
