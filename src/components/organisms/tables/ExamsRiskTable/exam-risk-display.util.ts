import type { IExamToRisk } from 'core/interfaces/api/IExam';

export const getExamPeriodic = (row: Partial<IExamToRisk>) => {
  const periodic = [] as string[];

  if (row.isAdmission) periodic.push('Admissional');
  if (row.isPeriodic) periodic.push('Periódico');
  if (row.isChange) periodic.push('Mudança');
  if (row.isReturn) periodic.push('Retorno');
  if (row.isDismissal) periodic.push('Demissional');

  return {
    text: periodic.map((p) => p.substring(0, 1)).join(', '),
    tooltip: periodic.join(', '),
  };
};

export const getExamAge = (exam: Partial<IExamToRisk>) => {
  if (!exam.toAge && !exam.fromAge) return 'todas';
  if (!exam.toAge && exam.fromAge)
    return 'a partir de ' + exam.fromAge + ' anos';
  if (exam.toAge && !exam.fromAge) return 'até ' + exam.toAge + ' anos';
  return exam.fromAge + ' a ' + exam.toAge + ' anos';
};
