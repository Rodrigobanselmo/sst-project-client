import { BoxProps } from '@mui/material';
import { ExamHistoryConclusionEnum } from 'project/enum/employee-exam-history-conclusion.enum';
import { ExamHistoryEvaluationEnum } from 'project/enum/employee-exam-history-evaluation.enum';
import { ExamHistoryTypeEnum } from 'project/enum/employee-exam-history-type.enum';
import { SexTypeEnum } from 'project/enum/sex.enums';

export interface SModalContactProps extends Omit<BoxProps, 'title'> {}
export interface SModalInitContactProps {
  phone?: string;
  cpf?: string;
  email?: string;
  name?: string;
  sex?: SexTypeEnum;
}
