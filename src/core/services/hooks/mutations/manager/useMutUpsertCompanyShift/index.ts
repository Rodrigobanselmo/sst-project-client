import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';
import { CompanyShift } from '../../../queries/useQueryCompanyShifts';

export type UpsertCompanyShiftInput = {
  id?: number;
  name: string;
  description?: string | null;
  durationMinutes?: number | null;
};

export function useMutUpsertCompanyShift() {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (input: UpsertCompanyShiftInput) => {
      if (!companyId) return null;
      const path = ApiRoutesEnum.COMPANY_SHIFTS.replace(':companyId', companyId);
      const body = {
        name: input.name,
        description: input.description || null,
        durationMinutes: input.durationMinutes ?? null,
      };
      const response = input.id
        ? await api.patch<CompanyShift>(`${path}/${input.id}`, body)
        : await api.post<CompanyShift>(path, body);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryEnum.COMPANY_SHIFTS]);
        queryClient.invalidateQueries([QueryEnum.COMPANY_SHIFT_JOURNEYS]);
        enqueueSnackbar('Turno salvo', { variant: 'success' });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response?.data?.message || 'Não foi possível salvar o turno', {
          variant: 'error',
        });
      },
    },
  );
}
