import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

interface FormQuestionOptionDto {
  id?: string;
  text: string;
  value?: number;
}

interface FormQuestionDetailsDto {
  text: string;
  identifierType: FormIdentifierTypeEnum;
  acceptOther?: boolean;
}

interface QuestionDto {
  id?: string;
  required: boolean;
  details: FormQuestionDetailsDto;
  options?: FormQuestionOptionDto[];
}

interface IdentifierDto {
  name: string;
  description?: string;
  questions: QuestionDto[];
}

export interface AddFormApplicationParams {
  name: string;
  description?: string;
  companyId: string;
  formId: string;
  workspaceIds: string[];
  hierarchyIds: string[];
  identifier: IdentifierDto;
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
