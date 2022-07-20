import { useQuery } from 'react-query';

import dayjs from 'dayjs';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskGroupData } from '../../../../interfaces/api/IRiskData';

interface IResp
  extends Omit<IRiskGroupData, 'visitDate' | 'validityStart' | 'validityEnd'> {
  visitDate: Date | null;
  validityStart: Date | null;
  validityEnd: Date | null;
}

export const queryGroupRiskDataOne = async (
  id: string,
  companyId: string,
): Promise<IRiskGroupData> => {
  const response = await api.get<IResp>(
    `${ApiRoutesEnum.RISK_GROUP_DATA}/${id}/${companyId}`,
  );

  const data: IRiskGroupData = {
    ...response.data,
    validityStartDate: response.data.validityStart,
    visitDate: response.data.visitDate
      ? dayjs(response.data.visitDate).format('DD/MM/YYYY')
      : '',
    validityStart: response.data.validityStart
      ? dayjs(response.data.validityStart).format('MM/YYYY')
      : '',
    validityEnd: response.data.validityEnd
      ? dayjs(response.data.validityEnd).format('MM/YYYY')
      : '',
  };

  return data;
};

export function useQueryRiskGroupDataOne(
  id: string,
): IReactQuery<IRiskGroupData | undefined> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_GROUP_DATA, companyId, id],
    () => (companyId ? queryGroupRiskDataOne(id, companyId) : undefined),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data };
}
