import { useQuery } from 'react-query';

import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
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

export function useQueryCompany(): IReactQuery<ICompany> {
  const { user } = useAuth();
  const router = useRouter();

  const company =
    user && ((router.query.companyId as string) || user?.companyId);

  const { data, ...query } = useQuery(
    [QueryEnum.COMPANY, company],
    () =>
      company ? queryCompany(company) : <Promise<ICompany>>emptyMapReturn(),
    {
      staleTime: 1000 * 60, // 1 minute
    },
  );

  return { ...query, data: data || ({} as unknown as ICompany) };
}
