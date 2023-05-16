import { IEmployee } from 'core/interfaces/api/IEmployee';

import { StatusEmployeeStepEnum } from './statusEmployeeStep.enum';

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
    const isInDismissal =
      employee.statusStep == StatusEmployeeStepEnum.IN_DEMISSION;

    if (isInDismissal)
      return [
        employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
        employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
        employeeExamTypeMap[ExamHistoryTypeEnum.PERI], // added
        employeeExamTypeMap[ExamHistoryTypeEnum.CHAN], // added
        employeeExamTypeMap[ExamHistoryTypeEnum.OFFI], // added
        employeeExamTypeMap[ExamHistoryTypeEnum.RETU], // added
        employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
      ];

    return [
      employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
      employeeExamTypeMap[ExamHistoryTypeEnum.OFFI], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.RETU], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.EVAL], // added
    ];
  }

  const isInAdmission =
    employee.statusStep == StatusEmployeeStepEnum.IN_ADMISSION;
  const isInOfficeChange =
    employee.statusStep == StatusEmployeeStepEnum.IN_TRANS;

  if (isInAdmission)
    return [
      employeeExamTypeMap[ExamHistoryTypeEnum.ADMI],
      employeeExamTypeMap[ExamHistoryTypeEnum.PERI], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.CHAN], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.OFFI], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
      employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
    ];

  if (isInOfficeChange)
    return [
      employeeExamTypeMap[ExamHistoryTypeEnum.OFFI],
      employeeExamTypeMap[ExamHistoryTypeEnum.PERI], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
      employeeExamTypeMap[ExamHistoryTypeEnum.CHAN],
      employeeExamTypeMap[ExamHistoryTypeEnum.ADMI], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.DEMI], // added
      employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
    ];

  return [
    employeeExamTypeMap[ExamHistoryTypeEnum.PERI],
    employeeExamTypeMap[ExamHistoryTypeEnum.RETU],
    employeeExamTypeMap[ExamHistoryTypeEnum.CHAN],
    employeeExamTypeMap[ExamHistoryTypeEnum.OFFI],
    employeeExamTypeMap[ExamHistoryTypeEnum.ADMI], // added
    employeeExamTypeMap[ExamHistoryTypeEnum.DEMI],
    employeeExamTypeMap[ExamHistoryTypeEnum.EVAL],
  ];
};
