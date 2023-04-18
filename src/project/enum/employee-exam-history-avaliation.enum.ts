import { ReactNode } from 'react';

import { SThumbDownIcon } from 'assets/icons/SThumbDownIcon';
import SWaitingIcon from 'assets/icons/SWaitingIcon';

import { SThumbUpIcon } from '../../assets/icons/SThumbUpIcon/index';

export enum ExamAvaliationEnum {
  ATTENDANCE = 'isAttendance',
  COMPLEMENTARY = 'isComplementary',
  EXAM_AVALIATION = 'isAvaliation',
}

export const examAvaliationTypeMap: Record<
  ExamAvaliationEnum,
  {
    value: ExamAvaliationEnum;
    content: string;
  }
> = {
  [ExamAvaliationEnum.ATTENDANCE]: {
    value: ExamAvaliationEnum.ATTENDANCE,
    content: 'Clínico',
  },
  [ExamAvaliationEnum.COMPLEMENTARY]: {
    value: ExamAvaliationEnum.COMPLEMENTARY,
    content: 'Complementar',
  },
  [ExamAvaliationEnum.EXAM_AVALIATION]: {
    value: ExamAvaliationEnum.EXAM_AVALIATION,
    content: 'Avaliação Méd.',
  },
};

export const examAvaliationTypeList = [
  examAvaliationTypeMap[ExamAvaliationEnum.ATTENDANCE],
  examAvaliationTypeMap[ExamAvaliationEnum.COMPLEMENTARY],
  examAvaliationTypeMap[ExamAvaliationEnum.EXAM_AVALIATION],
];
