import { useQuery } from 'react-query';

import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryCompanies = async () => {
  const response = await api.get<ICompany[]>(`${ApiRoutesEnum.COMPANIES}`);

  return response.data;
};

export function useQueryCompanies(): IReactQuery<ICompany[]> {
  const { user } = useAuth();
  const router = useRouter();

  const company =
    user && ((router.query.companyId as string) || user?.companyId);

  const { data, ...query } = useQuery(
    [QueryEnum.COMPANIES, company],
    () =>
      company ? queryCompanies() : <Promise<ICompany[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60, // 1 minute
    },
  );

  return { ...query, data: data || [] };
}
