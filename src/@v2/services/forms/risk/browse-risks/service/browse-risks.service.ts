import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  IRiskBrowseModel,
  RiskBrowseModel,
} from '@v2/models/form/models/risk/risk-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseRisksParams } from './browse-risks.types';

export async function browseRisks({
  pagination,
  companyId,
  filters = {},
}: BrowseRisksParams) {
  // Use the existing API endpoint for risks
  const url = bindUrlParams({
    path: FormRoutes.RISK.PATH,
    pathParams: { companyId },
    queryParams: {
      page: pagination?.page,
      limit: pagination?.limit,
      search: filters.search,
    },
  });

  const response = await api.get<IRiskBrowseModel>(url);
  console.log({ response });

  return new RiskBrowseModel(response.data);
}
