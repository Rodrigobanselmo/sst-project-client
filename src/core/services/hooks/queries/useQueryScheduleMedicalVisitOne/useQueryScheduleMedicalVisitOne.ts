import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { IScheduleMedicalVisit } from 'core/interfaces/api/IScheduleMedicalVisit';
import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryScheduleMedicalVisit {
  id: number;
  companyId?: string;
}

export const queryScheduleMedicalVisitOne = async ({
  id,
  companyId,
  ...query
}: IQueryScheduleMedicalVisit) => {
  const queries = queryString.stringify(query);

  if (!companyId || !id) return null;

  const response = await api.get<IScheduleMedicalVisit>(
    `${ApiRoutesEnum.SCHEDULE_MEDICAL_VISIT}/${id}?${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryScheduleMedicalVisitOne(
  query = {} as IQueryScheduleMedicalVisit,
) {
  const { companyId } = useGetCompanyId();

  const _companyId = query.companyId || companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.SCHEDULE_MEDICAL_VISIT, 'one', _companyId, { ...query }],
    () =>
      queryScheduleMedicalVisitOne({
        ...query,
        companyId: _companyId,
      }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...result, data };
}
