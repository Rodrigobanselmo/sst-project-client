import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  FormApplicationRiskLogParams,
  IFormApplicationRiskLogBrowseModelMapper,
} from './form-application-risk-log.types';

export async function browseFormApplicationRiskLog({
  companyId,
  applicationId,
}: FormApplicationRiskLogParams): Promise<IFormApplicationRiskLogBrowseModelMapper> {
  const response = await api.get<IFormApplicationRiskLogBrowseModelMapper>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_RISK_LOGS,
      pathParams: { companyId, applicationId },
    }),
  );

  return response.data;
}
