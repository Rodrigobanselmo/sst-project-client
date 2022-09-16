import { ISTagSelectProps } from 'components/molecules/STagSelect/types';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';

export interface IStatusSelectProps
  extends Partial<Omit<ISTagSelectProps, 'options'>> {
  expiresDate?: Date;
  selected?: ExamHistoryEvaluationEnum;
}
