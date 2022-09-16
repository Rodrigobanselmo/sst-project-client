import { ReactNode } from 'react';

import { SThumbDownIcon } from 'assets/icons/SThumbDownIcon';
import SWaitingIcon from 'assets/icons/SWaitingIcon';

import { SThumbUpIcon } from './../../assets/icons/SThumbUpIcon/index';

export enum ExamHistoryEvaluationEnum {
  NONE = 'NONE',
  APTO = 'APTO',
  INAPT = 'INAPT',
  INCONCLUSIVE = 'INCONCLUSIVE',
}

export const employeeExamEvaluationTypeMap: Record<
  ExamHistoryEvaluationEnum,
  {
    value: ExamHistoryEvaluationEnum;
    content: string;
    color?: string;
    icon: React.ElementType<any> | null | undefined;
  }
> = {
  [ExamHistoryEvaluationEnum.APTO]: {
    value: ExamHistoryEvaluationEnum.APTO,
    content: 'Apto',
    icon: SThumbUpIcon,
    color: 'success.main',
  },
  [ExamHistoryEvaluationEnum.INAPT]: {
    value: ExamHistoryEvaluationEnum.INAPT,
    content: 'Inapto',
    icon: SThumbDownIcon,
    color: 'error.main',
  },
  [ExamHistoryEvaluationEnum.INCONCLUSIVE]: {
    value: ExamHistoryEvaluationEnum.INCONCLUSIVE,
    content: 'Não conclusivo',
    icon: SWaitingIcon,
    color: 'waiting.main',
  },
  [ExamHistoryEvaluationEnum.NONE]: {
    value: ExamHistoryEvaluationEnum.NONE,
    content: 'Sem avaliação',
    icon: null,
    color: 'text.label',
  },
};

export const employeeExamEvaluationTypeList = [
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.APTO],
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.INAPT],
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.INCONCLUSIVE],
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.NONE],
];
