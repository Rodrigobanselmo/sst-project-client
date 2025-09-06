import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormApplicationRiskLog } from '../service/browse-form-application-risk-log.service';
import {
  FormApplicationRiskLogParams,
  IFormApplicationRiskLogBrowseModelMapper,
} from '../service/form-application-risk-log.types';

export const getKeyBrowseFormApplicationRiskLog = (
  params: FormApplicationRiskLogParams,
) => {
  return [
    QueryKeyFormEnum.FORM_APPLICATION_RISK_LOGS,
    params.companyId,
    params.applicationId,
  ];
};

export const useFetchBrowseFormApplicationRiskLog = (
  params: FormApplicationRiskLogParams,
) => {
  const { data, ...response } =
    useFetch<IFormApplicationRiskLogBrowseModelMapper>({
      queryFn: async () => {
        return browseFormApplicationRiskLog(params);
      },
      queryKey: getKeyBrowseFormApplicationRiskLog(params),
      enabled: !!params.companyId && !!params.applicationId,
    });

  return {
    ...response,
    riskLogs: data || [],
  };
};
