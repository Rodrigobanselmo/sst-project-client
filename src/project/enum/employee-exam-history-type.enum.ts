export enum ExamHistoryTypeEnum {
  ADMI = 'ADMI',
  PERI = 'PERI',
  RETU = 'RETU',
  CHAN = 'CHAN',
  EVAL = 'EVAL',
  DEMI = 'DEMI',
}

export const employeeExamTypeMap: Record<
  ExamHistoryTypeEnum,
  {
    value: ExamHistoryTypeEnum;
    content: string;
  }
> = {
  [ExamHistoryTypeEnum.ADMI]: {
    value: ExamHistoryTypeEnum.ADMI,
    content: 'Admissional',
  },
  [ExamHistoryTypeEnum.PERI]: {
    value: ExamHistoryTypeEnum.PERI,
    content: 'Periódico',
  },
  [ExamHistoryTypeEnum.RETU]: {
    value: ExamHistoryTypeEnum.RETU,
    content: 'Retorno ao trabalho',
  },
  [ExamHistoryTypeEnum.CHAN]: {
    value: ExamHistoryTypeEnum.CHAN,
    content: 'Mudança de risco ocupacional',
  },
  [ExamHistoryTypeEnum.DEMI]: {
    value: ExamHistoryTypeEnum.DEMI,
    content: 'Demissional',
  },
  [ExamHistoryTypeEnum.EVAL]: {
    value: ExamHistoryTypeEnum.EVAL,
    content: 'Avaliação médica',
  },
};

export const employeeExamTypeList = [
  employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
  employeeExamTypeMap[ExamHistoryTypeEnum.PERI],
  employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
  employeeExamTypeMap[ExamHistoryTypeEnum.CHAN],
  employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
  employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
];
