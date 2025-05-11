import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import {
  IStatusBrowseModel,
  StatusBrowseModel,
} from '@v2/models/security/models/status/status-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface BrowseStatusParams {
  companyId: string;
  type: StatusTypeEnum;
}

export async function browseStatus({ type, companyId }: BrowseStatusParams) {
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
