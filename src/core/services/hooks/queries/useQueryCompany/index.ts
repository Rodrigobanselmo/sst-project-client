import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryCompany = async (company: string) => {
  const response = await api.get<ICompany>(
    `${ApiRoutesEnum.COMPANIES}/${company}`,
  );
  return response.data;
};

export function useQueryCompany(
  getCompanyId?: string | null,
): IReactQuery<ICompany> {
  const { companyId } = useGetCompanyId();
  const companyID = getCompanyId || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.COMPANY, companyID],
    () =>
      companyID ? queryCompany(companyID) : <Promise<ICompany>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as ICompany) };
}
