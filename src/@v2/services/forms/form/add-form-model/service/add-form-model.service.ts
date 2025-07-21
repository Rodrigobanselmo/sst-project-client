import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';

export interface IFormQuestionOption {
  text: string;
  value?: number;
}

export interface IFormQuestionData {
  text: string;
  type: FormQuestionTypeEnum;
  acceptOther?: boolean;
}

export interface IFormQuestion {
  required?: boolean;
  data: IFormQuestionData;
  options?: IFormQuestionOption[];
}

export interface IFormQuestionGroup {
  name: string;
  description?: string;
  questions: IFormQuestion[];
}

export interface AddFormParams {
  companyId: string;
  name: string;
  description?: string;
  type?: FormTypeEnum;
  anonymous?: boolean;
  shareableLink?: boolean;
  questionGroups?: IFormQuestionGroup[];
}

export async function addFormModel({ companyId, ...body }: AddFormParams) {
  await api.post(
    bindUrlParams({
      path: FormRoutes.FORM.PATH,
      pathParams: { companyId },
    }),
    body,
  );
}
