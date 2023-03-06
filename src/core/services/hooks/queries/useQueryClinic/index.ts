import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryClinic = async (company: string) => {
  const response = await api.get<ICompany>(
    `${ApiRoutesEnum.COMPANIES}/clinic/${company}`,
  );
  return response.data;
};

export function useQueryClinic(
  getCompanyId?: string | null,
): IReactQuery<ICompany> {
  const { companyId } = useGetCompanyId();
  const companyID = getCompanyId || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.COMPANY, 'clinic', companyID],
    () =>
      companyID ? queryClinic(companyID) : <Promise<ICompany>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as ICompany) };
}

export function useFetchQueryClinic() {
  const { companyId } = useGetCompanyId();

  const fetchClinic = async (id?: string) => {
    const companyID = id || companyId;

    const data = await queryClient
      .fetchQuery(
        [QueryEnum.COMPANY, 'clinic', companyID],
        () =>
          companyID
            ? queryClinic(companyID)
            : <Promise<ICompany>>emptyMapReturn(),
        {
          staleTime: 1000 * 60 * 60, // 60 minute
        },
      )
      .catch((e) => console.error(e));

    return data;
  };

  const getClinic = (id?: string) => {
    const companyID = id || companyId;
    return queryClient.getQueryData([
      QueryEnum.COMPANY,
      'clinic',
      companyID,
    ]) as ICompany | undefined;
  };

  return { fetchClinic, getClinic };
}
