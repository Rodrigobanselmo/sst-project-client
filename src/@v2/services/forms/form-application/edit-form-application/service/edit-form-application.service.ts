import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface EditFormApplicationParams {
  applicationId: string;
  companyId: string;
  name?: string;
  description?: string | null;
  formId?: number;
  status?: FormApplicationStatusEnum;
  workspaceIds?: string[];
  hierarchyIds?: string[];
  identifier?: {
    name?: string;
    description?: string;
    questions?: {
      required: boolean;
      order: number;
      questionDataId: number;
    }[];
  };
}

export async function editFormApplication({
  companyId,
  applicationId,
  ...body
}: EditFormApplicationParams) {
  await api.patch(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_ID,
      pathParams: { companyId, applicationId },
    }),
    { ...body },
  );
}
