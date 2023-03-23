import { IEmployee } from 'core/interfaces/api/IEmployee';

export enum ExamHistoryTypeEnum {
  ADMI = 'ADMI',
  PERI = 'PERI',
  RETU = 'RETU',
  CHAN = 'CHAN',
  EVAL = 'EVAL',
  DEMI = 'DEMI',
  OFFI = 'OFFI',
}

export const employeeExamTypeMap: Record<
  ExamHistoryTypeEnum,
  {
    value: ExamHistoryTypeEnum;
    content: string;
    type:
      | 'isPeriodic'
      | 'isChange'
      | 'isAdmission'
      | 'isReturn'
      | 'isDismissal';
  }
> = {
  [ExamHistoryTypeEnum.ADMI]: {
    value: ExamHistoryTypeEnum.ADMI,
    content: 'Admissional',
    type: 'isAdmission',
  },
  [ExamHistoryTypeEnum.PERI]: {
    value: ExamHistoryTypeEnum.PERI,
    content: 'Periódico',
    type: 'isPeriodic',
  },
  [ExamHistoryTypeEnum.RETU]: {
    value: ExamHistoryTypeEnum.RETU,
    content: 'Retorno ao trabalho',
    type: 'isReturn',
  },
  [ExamHistoryTypeEnum.CHAN]: {
    value: ExamHistoryTypeEnum.CHAN,
    content: 'Mudança de risco ocupacional',
    type: 'isChange',
  },
  [ExamHistoryTypeEnum.DEMI]: {
    value: ExamHistoryTypeEnum.DEMI,
    content: 'Demissional',
    type: 'isDismissal',
  },
  [ExamHistoryTypeEnum.EVAL]: {
    value: ExamHistoryTypeEnum.EVAL,
    content: 'Avaliação médica',
    type: 'isPeriodic',
  },
  [ExamHistoryTypeEnum.OFFI]: {
    value: ExamHistoryTypeEnum.OFFI,
    content: 'Mudança de Cargo/Função',
    type: 'isPeriodic',
  },
};

export const employeeToAsoExamTypeTranslate: Record<
  string,
  ExamHistoryTypeEnum
> = {
  [ExamHistoryTypeEnum.ADMI]: ExamHistoryTypeEnum.ADMI,
  [ExamHistoryTypeEnum.PERI]: ExamHistoryTypeEnum.PERI,
  [ExamHistoryTypeEnum.CHAN]: ExamHistoryTypeEnum.CHAN,
  [ExamHistoryTypeEnum.RETU]: ExamHistoryTypeEnum.RETU,
  [ExamHistoryTypeEnum.DEMI]: ExamHistoryTypeEnum.DEMI,
  [ExamHistoryTypeEnum.OFFI]: ExamHistoryTypeEnum.CHAN,
  [ExamHistoryTypeEnum.EVAL]: ExamHistoryTypeEnum.EVAL,
};

export const employeeExamTypeList = [
  employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
  employeeExamTypeMap[ExamHistoryTypeEnum.PERI],
  employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
  employeeExamTypeMap[ExamHistoryTypeEnum.CHAN],
  employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
  employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
  employeeExamTypeMap[ExamHistoryTypeEnum.OFFI],
];

export const asoExamTypeList = [
  employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
  employeeExamTypeMap[ExamHistoryTypeEnum.PERI],
  employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
  employeeExamTypeMap[ExamHistoryTypeEnum.CHAN],
  employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
];

export const employeeExamScheduleTypeList = (employee?: IEmployee) => {
  if (!employee) return [];

  if (!employee.hierarchyId) {
    const dismissalWithoutExam =
      !employee.skippedDismissalExam && employee.expiredDateExam !== null;

    if (dismissalWithoutExam)
      return [
        employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
        employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
      ];

    return [employeeExamTypeMap[ExamHistoryTypeEnum.ADMI]];
  }

  if (!employee.hierarchyId && employee.expiredDateExam === null)
    return [employeeExamTypeMap[ExamHistoryTypeEnum.ADMI]];

  return [
    employeeExamTypeMap[ExamHistoryTypeEnum.PERI],
    employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
    employeeExamTypeMap[ExamHistoryTypeEnum.CHAN],
    employeeExamTypeMap[ExamHistoryTypeEnum.OFFI],
    employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
    employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
  ];
};
