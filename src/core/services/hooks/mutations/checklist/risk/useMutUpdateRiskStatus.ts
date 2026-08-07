import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { StatusEnum } from 'project/enum/status.enum';

export function useMutUpdateRiskStatus() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, user } = useGetCompanyId(true);

  return useMutation(
    async (params: {
      id: string;
      status: StatusEnum;
      companyId?: string;
    }) => {
      const cid = params.companyId || user?.companyId || companyId;
      if (!cid) return null;
      const { data } = await api.patch(`${ApiRoutesEnum.RISK}/${params.id}`, {
        id: params.id,
        status: params.status,
        companyId: cid,
      });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryEnum.RISK]);
        enqueueSnackbar('Status do fator atualizado.', { variant: 'success' });
      },
      onError: (err: any) => {
        enqueueSnackbar(
          err?.response?.data?.message || 'Falha ao atualizar status.',
          { variant: 'error' },
        );
      },
    },
  );
}
