import { FormIdentifierTypeEnum } from '../../enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '../../enums/form-question-type.enum';

export type IFormQuestionDetailsReadModel = {
  id: string;
  text: string;
  type: FormQuestionTypeEnum;
  identifierType?: FormIdentifierTypeEnum;
  acceptOther?: boolean;
  system?: boolean;
  companyId?: string;
};

export class FormQuestionDetailsReadModel {
  id: string;
  text: string;
  type: FormQuestionTypeEnum;
  identifierType: FormIdentifierTypeEnum;
  acceptOther?: boolean;
  system?: boolean;
  companyId?: string;

  constructor(params: IFormQuestionDetailsReadModel) {
    this.id = params.id;
    this.text = params.text;
    this.type = params.type;
    this.acceptOther = params.acceptOther;
    this.identifierType =
      params.identifierType || FormIdentifierTypeEnum.CUSTOM;
    this.system = params.system;
    this.companyId = params.companyId;
  }
}
