import { QuestionOptionsEnum } from 'components/main/ChecklistTree/enums/question-options.enums';
import { ITreeMapObject } from 'components/main/ChecklistTree/interfaces';

export interface IStandardQuestionOptions {
  value: QuestionOptionsEnum;
  options: Partial<ITreeMapObject>[];
}
interface IStandardQuestionTypes
  extends Record<QuestionOptionsEnum, IStandardQuestionOptions> {}

export const standardQuestionsConstant = {
  [QuestionOptionsEnum.YEW_NO_NA]: {
    value: QuestionOptionsEnum.YEW_NO_NA,
    options: [{ label: 'Sim' }, { label: 'Não' }, { label: 'N.A.' }],
  },
} as IStandardQuestionTypes;
