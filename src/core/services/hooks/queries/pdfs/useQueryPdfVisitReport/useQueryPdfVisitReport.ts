import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { IPdfKitData, IPdfKitDataApi } from 'core/interfaces/api/IPdfKitData';
import { IPdfVisitReportData } from 'core/interfaces/api/IPdfVisitReportData';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn, emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../../enums/query.enums';

export interface IQuery {
  scheduleMedicalVisitId?: number;
}

export const queryVisitReport = async (
  companyId: string,
  query?: IQuery,
): Promise<IPdfVisitReportData> => {
  const queries = queryString.stringify(query || {});

  const response = await api.get<IPdfVisitReportData>(
    ApiRoutesEnum.PDF_VISIT_REPORT + `/${companyId}?${queries}`,
  );

  return response.data;
};

export function useQueryPdfVisitReport(
  queries?: IQuery,
  companyIdProp?: string,
) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PDF_KIT, companyIdSelected, queries],
    () =>
      companyIdSelected
        ? queryVisitReport(companyIdSelected, queries)
        : <Promise<IPdfVisitReportData>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
