import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';

export interface IFormQuestionOption {
  id?: string;
  text: string;
  value?: number;
}

export interface IFormQuestionDetails {
  id?: string;
  text: string;
  type: FormQuestionTypeEnum;
  acceptOther?: boolean;
  risksIds?: string[];
}

export interface IFormQuestion {
  id?: string;
  required?: boolean;
  details: IFormQuestionDetails;
  options?: IFormQuestionOption[];
}

export interface IFormQuestionGroup {
  id?: string;
  name: string;
  description?: string;
  questions: IFormQuestion[];
}

export interface EditFormParams {
  companyId: string;
  formId: string;
  name?: string;
  description?: string;
  type?: FormTypeEnum;
  anonymous?: boolean;
  shareableLink?: boolean;
  questionGroups?: IFormQuestionGroup[];
}

export async function editFormModel({
  companyId,
  formId,
  ...body
}: EditFormParams) {
  await api.patch(
    bindUrlParams({
      path: FormRoutes.FORM.PATH_ID,
      pathParams: { companyId, formId },
    }),
    body,
  );
}
