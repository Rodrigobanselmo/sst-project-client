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
  }
> = {
  [ExamHistoryEvaluationEnum.APTO]: {
    value: ExamHistoryEvaluationEnum.APTO,
    content: 'Apto',
  },
  [ExamHistoryEvaluationEnum.INAPT]: {
    value: ExamHistoryEvaluationEnum.INAPT,
    content: 'Inapto',
  },
  [ExamHistoryEvaluationEnum.INCONCLUSIVE]: {
    value: ExamHistoryEvaluationEnum.INCONCLUSIVE,
    content: 'Não conclusivo',
  },
  [ExamHistoryEvaluationEnum.NONE]: {
    value: ExamHistoryEvaluationEnum.NONE,
    content: 'Sem avaliação',
  },
};

export const employeeExamEvaluationTypeList = [
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.APTO],
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.INAPT],
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.INCONCLUSIVE],
  employeeExamEvaluationTypeMap[ExamHistoryEvaluationEnum.NONE],
];
