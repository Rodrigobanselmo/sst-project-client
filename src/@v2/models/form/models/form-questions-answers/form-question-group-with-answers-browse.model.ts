import { FormQuestionWithAnswersBrowseModel } from './form-question-with-answers-browse.model';

export type IFormQuestionGroupWithAnswersBrowseModel = {
  id: string;
  name: string;
  description?: string;
  identifier: boolean;
  order: number;
  questions: FormQuestionWithAnswersBrowseModel[];
};

export class FormQuestionGroupWithAnswersBrowseModel {
  id: string;
  name: string;
  description?: string;
  identifier: boolean;
  order: number;
  questions: FormQuestionWithAnswersBrowseModel[];

  constructor(params: IFormQuestionGroupWithAnswersBrowseModel) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.identifier = params.identifier;
    this.order = params.order;
    this.questions = params.questions
      .map((question) => new FormQuestionWithAnswersBrowseModel(question))
      .sort((a, b) => a.order - b.order);
  }
}
