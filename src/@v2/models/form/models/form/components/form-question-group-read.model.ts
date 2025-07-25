import { FormQuestionTypeEnum } from '../../../enums/form-question-type.enum';

export interface IFormQuestionOptionReadModel {
  id: string;
  text: string;
  value?: number;
  order: number;
}

export interface IFormQuestionDetailsReadModel {
  id: string;
  text: string;
  type: FormQuestionTypeEnum;
  acceptOther?: boolean;
}

export interface IFormQuestionReadModel {
  id: string;
  required?: boolean;
  details: IFormQuestionDetailsReadModel;
  options?: IFormQuestionOptionReadModel[];
  order: number;
}

export interface IFormQuestionGroupReadModel {
  id: string;
  name: string;
  description?: string;
  questions: IFormQuestionReadModel[];
  order: number;
}

export class FormQuestionGroupReadModel {
  id: string;
  name: string;
  description?: string;
  questions: IFormQuestionReadModel[];
  order: number;

  constructor(params: IFormQuestionGroupReadModel) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.questions = params.questions;
    this.order = params.order;
  }
}
