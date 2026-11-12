import { FormParticipantStructureBrowseModel } from './form-participant-structure-browse.model';
import { FormQuestionGroupWithAnswersBrowseModel } from './form-question-group-with-answers-browse.model';

export type IFormQuestionsAnswersBrowseModel = {
  allowPartialResults?: boolean;
  results: FormQuestionGroupWithAnswersBrowseModel[];
  participantStructures?: FormParticipantStructureBrowseModel[];
};

export class FormQuestionsAnswersBrowseModel {
  allowPartialResults: boolean;
  results: FormQuestionGroupWithAnswersBrowseModel[];
  participantStructures: FormParticipantStructureBrowseModel[];

  constructor(params: IFormQuestionsAnswersBrowseModel) {
    this.allowPartialResults = params.allowPartialResults === true;
    this.results = params.results
      .map((result) => new FormQuestionGroupWithAnswersBrowseModel(result))
      .sort((a, b) => a.order - b.order);
    this.participantStructures = (params.participantStructures ?? []).map(
      (structure) => new FormParticipantStructureBrowseModel(structure),
    );
  }
}
