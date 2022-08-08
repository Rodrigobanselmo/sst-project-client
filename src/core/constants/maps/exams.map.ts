import { ExamTypeEnum } from 'core/interfaces/api/IExam';

export interface IExamsOption {
  value: ExamTypeEnum;
  name: string;
}
interface IExamsOptions extends Record<ExamTypeEnum, IExamsOption> {}

export const examMap = {
  [ExamTypeEnum.LAB]: {
    value: ExamTypeEnum.LAB,
    name: 'Coleta em laboratório',
  },
  [ExamTypeEnum.AUDIO]: {
    value: ExamTypeEnum.AUDIO,
    name: 'Audiometria',
  },
  [ExamTypeEnum.VISUAL]: {
    value: ExamTypeEnum.VISUAL,
    name: 'Exame visual',
  },
  [ExamTypeEnum.OTHERS]: {
    value: ExamTypeEnum.OTHERS,
    name: 'Outros',
  },
} as IExamsOptions;

export const examsOptionsList = [
  examMap[ExamTypeEnum.LAB],
  examMap[ExamTypeEnum.AUDIO],
  examMap[ExamTypeEnum.VISUAL],
  examMap[ExamTypeEnum.OTHERS],
];
