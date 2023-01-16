import { useMutation } from 'react-query';

import { ReportDownloadtypeEnum } from 'components/atoms/STable/components/STableFilter/STableFilterBox/constants/report-type.constants';
import { useSnackbar } from 'notistack';

import { refreshToken } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { downloadFile } from 'core/utils/helpers/downloadFile';

import { IErrorResp } from '../../../../errors/types';

export interface IReportBase {
  companyId: string;
  downloadType?: ReportDownloadtypeEnum;
  companiesIds?: string[];
  companiesGroupIds?: string[];
}

export interface IReportClinic extends IReportBase {
  cities?: string[];
  uf?: string[];
}

export async function mutReportClinic(data: IReportClinic, companyId: string) {
  const { token } = await refreshToken();
  const response = await api.post(
    `${ApiRoutesEnum.REPORT_CLINIC}`.replace(':companyId', companyId),
    {
      ...data,
    },
    {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.headers['content-type'] === 'application/json; charset=utf-8')
    return response.data;

  downloadFile(response);

  return data;
}

export function useMutReportClinic() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IReportClinic) => mutReportClinic(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp.isXml)
          enqueueSnackbar('Documento baixado com sucesso', {
            variant: 'success',
          });

        console.log(resp);
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
