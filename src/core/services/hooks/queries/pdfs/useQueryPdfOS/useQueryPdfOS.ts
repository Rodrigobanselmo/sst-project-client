import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPdfKitData } from 'core/interfaces/api/IPdfKitData';
import { IPdfOSData } from 'core/interfaces/api/IPdfOSData';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../../enums/query.enums';

export const queryOS = async (
  employeeId: string,
  companyId: string,
): Promise<IPdfOSData> => {
  const response = await api.get<IPdfOSData>(
    ApiRoutesEnum.PDF_OS + `/${employeeId}` + `/${companyId}`,
  );

  return response.data;
};

export function useQueryPdfOS(employeeId?: string, companyIdProp?: string) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PDF_OS, companyIdSelected, employeeId],
    () =>
      companyIdSelected && employeeId
        ? queryOS(employeeId, companyIdSelected)
        : <Promise<IPdfOSData>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
