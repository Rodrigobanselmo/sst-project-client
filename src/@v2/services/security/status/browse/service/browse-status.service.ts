import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  IStatusBrowseModel,
  StatusBrowseModel,
} from '@v2/models/security/models/status/status-browse.model';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { simulateAwait } from 'core/utils/helpers/simulateAwait';

export interface BrowseStatusParams {
  companyId: string;
  type: StatusTypeEnum;
}

export async function browseStatus({ type, companyId }: BrowseStatusParams) {
  await simulateAwait(1000);
  const response = await api.get<IStatusBrowseModel>(
    bindUrlParams({
      path: CharacterizationRoutes.STATUS.BROWSE,
      pathParams: { companyId },
      queryParams: {
        type,
      },
    }),
  );

  return new StatusBrowseModel(response.data);
}
