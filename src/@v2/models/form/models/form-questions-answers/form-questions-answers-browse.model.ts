import { FormQuestionGroupWithAnswersBrowseModel } from './form-question-group-with-answers-browse.model';

export type IFormQuestionsAnswersBrowseModel = {
  results: FormQuestionGroupWithAnswersBrowseModel[];
};

export class FormQuestionsAnswersBrowseModel {
  results: FormQuestionGroupWithAnswersBrowseModel[];

  constructor(params: IFormQuestionsAnswersBrowseModel) {
    this.results = params.results
      .map((result) => new FormQuestionGroupWithAnswersBrowseModel(result))
      .sort((a, b) => a.order - b.order);
  }
}
