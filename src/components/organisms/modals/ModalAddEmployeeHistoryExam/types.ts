import { BoxProps } from '@mui/material';
import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';

export interface SModalContactProps extends Omit<BoxProps, 'title'> {}
export interface SModalInitContactProps {
  validityInMonths: number;
  examType: ExamHistoryTypeEnum;
  evaluationType: ExamHistoryEvaluationEnum;
  conclusion: ExamHistoryConclusionEnum;
  obs?: string;
  time: string;
}
