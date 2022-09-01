export enum ExamHistoryConclusionEnum {
  NORMAL = 'NORMAL',
  ALTER = 'ALTER',
  ALTER_1 = 'ALTER_1',
  ALTER_2 = 'ALTER_2',
  ALTER_3 = 'ALTER_3',
  NONE = 'NONE',
}

export const employeeExamConclusionTypeMap: Record<
  ExamHistoryConclusionEnum,
  {
    value: ExamHistoryConclusionEnum;
    content: string;
  }
> = {
  [ExamHistoryConclusionEnum.NORMAL]: {
    value: ExamHistoryConclusionEnum.NORMAL,
    content: 'Normal',
  },
  [ExamHistoryConclusionEnum.ALTER]: {
    value: ExamHistoryConclusionEnum.ALTER,
    content: 'Alterado',
  },
  [ExamHistoryConclusionEnum.ALTER_1]: {
    value: ExamHistoryConclusionEnum.ALTER_1,
    content: 'Alterado estável',
  },
  [ExamHistoryConclusionEnum.ALTER_2]: {
    value: ExamHistoryConclusionEnum.ALTER_2,
    content: 'Alterado com agravamento ocupacional',
  },
  [ExamHistoryConclusionEnum.ALTER_3]: {
    value: ExamHistoryConclusionEnum.ALTER_3,
    content: 'Alterado com agravamento não ocupacional',
  },
  [ExamHistoryConclusionEnum.NONE]: {
    value: ExamHistoryConclusionEnum.NONE,
    content: 'Sem conclusão',
  },
};

export const employeeExamConclusionTypeList = [
  employeeExamConclusionTypeMap[ExamHistoryConclusionEnum.NORMAL],
  employeeExamConclusionTypeMap[ExamHistoryConclusionEnum.ALTER],
  employeeExamConclusionTypeMap[ExamHistoryConclusionEnum.ALTER_1],
  employeeExamConclusionTypeMap[ExamHistoryConclusionEnum.ALTER_2],
  employeeExamConclusionTypeMap[ExamHistoryConclusionEnum.ALTER_3],
  employeeExamConclusionTypeMap[ExamHistoryConclusionEnum.NONE],
];
