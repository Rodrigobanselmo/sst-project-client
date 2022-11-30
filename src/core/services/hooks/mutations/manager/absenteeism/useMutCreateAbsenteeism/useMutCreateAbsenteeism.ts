import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAbsenteeism } from 'core/interfaces/api/IAbsenteeism';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateAbsenteeism {
  startDate: Date;
  endDate: Date;
  timeUnit: DateUnitEnum;
  employeeId: number;

  // startTime?: number;
  // endTime?: number;
  docId?: number;
  cidId?: string;
  status?: StatusEnum;
  companyId?: string;
  isJustified?: boolean;
  isExtern?: boolean;
  local?: string;
  observation?: string;
  sameAsBefore?: boolean;
  traffic?: number;
  vacationStartDate?: Date;
  vacationEndDate?: Date;
  cnpjSind?: string;
  infOnusRemun?: number;
  cnpjMandElet?: string;
  origRetif?: number;
  tpProc?: number;
  nrProc?: number;
  motiveId?: number;
  esocial18Motive?: number;
}

export async function upsertRiskDocs(
  data: ICreateAbsenteeism,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IAbsenteeism>(
    ApiRoutesEnum.ABSENTEEISMS.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateAbsenteeism() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateAbsenteeism) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.ABSENTEEISMS]);

        enqueueSnackbar('Falta criado com sucesso', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
