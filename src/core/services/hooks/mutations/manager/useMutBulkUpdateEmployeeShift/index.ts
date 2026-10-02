import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';
import { invalidateEmployeeOrgViews } from '../invalidate-employee-org-views';

export type BulkUpdateEmployeeShiftInput = {
  ids: number[];
  shiftId: number | null;
  companyId?: string;
};

export async function bulkUpdateEmployeeShift(
  data: BulkUpdateEmployeeShiftInput,
  companyId?: string,
) {
  if (!companyId) return null;
  const response = await api.post<{
    count: number;
    ids: number[];
    shiftId: number | null;
  }>(`${ApiRoutesEnum.EMPLOYEES}/bulk/shift`, {
    ...data,
    companyId,
  });
  return response.data;
}

export function useMutBulkUpdateEmployeeShift() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: BulkUpdateEmployeeShiftInput) =>
      bulkUpdateEmployeeShift(data, getCompanyId(data.companyId)),
    {
      onSuccess: (resp) => {
        if (resp) {
          invalidateEmployeeOrgViews();
          queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
          queryClient.invalidateQueries([QueryEnum.COMPANY_SHIFT_JOURNEYS]);
        }
        enqueueSnackbar(
          resp?.shiftId == null
            ? `Turno removido de ${resp?.count ?? 0} funcionário(s)`
            : `Turno definido para ${resp?.count ?? 0} funcionário(s)`,
          { variant: 'success' },
        );
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Não foi possível atualizar o turno',
          { variant: 'error' },
        );
      },
    },
  );
}
