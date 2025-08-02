import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface FormQuestionOption {
  id?: string;
  text: string;
  value?: number;
}

export interface FormQuestionDetails {
  text: string;
  type: FormQuestionTypeEnum;
  identifierType: FormIdentifierTypeEnum;
  acceptOther?: boolean;
}

export interface Question {
  id?: string;
  required: boolean;
  details: FormQuestionDetails;
  options?: FormQuestionOption[];
}

export interface Identifier {
  name: string;
  description?: string;
  questions: Question[];
}

export interface EditFormApplicationParams {
  applicationId: string;
  companyId: string;
  name?: string;
  description?: string;
  formId?: string;
  status?: FormApplicationStatusEnum;
  workspaceIds?: string[];
  hierarchyIds?: string[];
  identifier?: Identifier;
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
