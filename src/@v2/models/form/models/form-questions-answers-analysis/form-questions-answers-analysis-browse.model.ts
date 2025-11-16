import { FormQuestionsAnswersAnalysisBrowseResultModel } from './form-questions-answers-analysis-browse-result.model';

export type IFormQuestionsAnswersAnalysisBrowseModel = {
  results: FormQuestionsAnswersAnalysisBrowseResultModel[];
};

export class FormQuestionsAnswersAnalysisBrowseModel {
  results: FormQuestionsAnswersAnalysisBrowseResultModel[];

  constructor(params: IFormQuestionsAnswersAnalysisBrowseModel) {
    this.results = params.results.map(
      (result) => new FormQuestionsAnswersAnalysisBrowseResultModel(result),
    );
  }
}
