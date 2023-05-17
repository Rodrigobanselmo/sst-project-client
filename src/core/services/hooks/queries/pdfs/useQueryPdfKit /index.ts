import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { IPdfKitData, IPdfKitDataApi } from 'core/interfaces/api/IPdfKitData';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn, emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../../enums/query.enums';

export interface IQuery {
  asoId?: number;
  employeeId?: number;
  scheduleMedicalVisitId?: number;
}

export const queryGuide = async (
  companyId: string,
  query?: IQuery,
): Promise<IPdfKitData[]> => {
  const queries = queryString.stringify(query || {});

  const response = await api.get<IPdfKitDataApi[]>(
    ApiRoutesEnum.PDF_KIT + `/${companyId}?${queries}`,
  );

  return response.data.map<IPdfKitData>((item) => {
    const aso = item?.aso;

    return {
      ...item,
      prontuario: {
        ...item?.prontuario,
        actualCompany: aso?.actualCompany,
        clinicExam: aso?.clinicExam,
        admissionDate: aso?.admissionDate,
        consultantCompany: aso?.consultantCompany,
        employee: aso?.employee,
        risks: aso?.risks,
        sector: aso?.sector,
        doneExams: aso?.doneExams,
        doctorResponsible: aso?.doctorResponsible,
      },
    };
  });
};

export function useQueryPdfKit(queries?: IQuery, companyIdProp?: string) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PDF_KIT, companyIdSelected, queries],
    () =>
      companyIdSelected
        ? queryGuide(companyIdSelected, queries)
        : <Promise<IPdfKitData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
