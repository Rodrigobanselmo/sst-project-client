import { ConsolidatedViewEligibleApplicationModel } from './consolidated-view-eligibility.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

export type ConsolidatedViewQuestionMetaModel = {
  canonicalQuestionKey: string;
  canonicalGroupKey: string;
  groupKind: 'identifier' | 'content';
  isMeasurable: boolean;
  isDemographic: boolean;
};

export type ConsolidatedViewQuestionsAnswersModel = {
  mode: 'virtual_consolidated';
  businessGroupId: number;
  businessGroupName: string;
  applications: ConsolidatedViewEligibleApplicationModel[];
  structureFingerprint: string;
  questionMetaById: Record<string, ConsolidatedViewQuestionMetaModel>;
  totals: {
    totalParticipants: number;
    totalResponded: number;
    totalNotResponded: number;
    completionPercent: number;
  };
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
};

export function toConsolidatedViewQuestionsAnswersModel(
  payload: Omit<ConsolidatedViewQuestionsAnswersModel, 'formQuestionsAnswers'> & {
    results: FormQuestionsAnswersBrowseModel['results'];
    participantStructures: FormQuestionsAnswersBrowseModel['participantStructures'];
  },
): ConsolidatedViewQuestionsAnswersModel {
  const { results, participantStructures, ...rest } = payload;

  return {
    ...rest,
    formQuestionsAnswers: new FormQuestionsAnswersBrowseModel({
      results,
      participantStructures,
    }),
  };
}
