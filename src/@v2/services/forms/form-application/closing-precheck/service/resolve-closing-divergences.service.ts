import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  ResolveClosingDivergencesParams,
  ResolveClosingDivergencesResult,
} from './closing-precheck.types';

export async function resolveClosingDivergences({
  companyId,
  applicationId,
  action,
  observation,
  items,
}: ResolveClosingDivergencesParams) {
  const response = await api.post<ResolveClosingDivergencesResult>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_CLOSING_PRECHECK_RESOLUTIONS,
      pathParams: { companyId, applicationId },
    }),
    { action, observation, items },
  );

  return response.data;
}
