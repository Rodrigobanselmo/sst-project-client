import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface AddFormApplicationParams {
  name: string;
  description?: string;
  companyId: string;
  formId: string;
  workspaceIds: string[];
  hierarchyIds: string[];
  identifier?: {
    name: string;
    description?: string;
    questions: {
      required: boolean;
      order: number;
      questionDataId: string;
    }[];
  };
}

export async function addFormApplication({
  companyId,
  ...body
}: AddFormApplicationParams) {
  await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH,
      pathParams: { companyId },
    }),
    body,
  );
}
