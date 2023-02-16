import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPdfGuideData } from 'core/interfaces/api/IPdfGuideData';
import { IPdfKitData, IPdfKitDataApi } from 'core/interfaces/api/IPdfKitData';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../../enums/query.enums';

export const queryGuide = async (
  employeeId: string,
  companyId: string,
  asoId?: string,
): Promise<IPdfKitData> => {
  const response = await api.get<IPdfKitDataApi>(
    ApiRoutesEnum.PDF_KIT +
      `/${employeeId}` +
      `/${companyId}` +
      (asoId ? `/${asoId}` : ''),
  );

  const aso = response.data?.aso;

  return {
    ...response.data,
    prontuario: {
      ...response.data?.prontuario,
      actualCompany: aso?.actualCompany,
      clinicExam: aso?.clinicExam,
      admissionDate: aso?.admissionDate,
      consultantCompany: aso?.consultantCompany,
      employee: aso?.employee,
      risks: aso?.risks,
      sector: aso?.sector,
      doctorResponsible: aso?.doctorResponsible,
    },
  };
};

export function useQueryPdfKit(
  asoId?: string,
  employeeId?: string,
  companyIdProp?: string,
) {
  const { companyId } = useGetCompanyId();
  const companyIdSelected = companyIdProp || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.PDF_KIT, companyIdSelected, employeeId, asoId],
    () =>
      companyIdSelected && employeeId
        ? queryGuide(employeeId, companyIdSelected, asoId)
        : <Promise<IPdfKitData>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data };
}
