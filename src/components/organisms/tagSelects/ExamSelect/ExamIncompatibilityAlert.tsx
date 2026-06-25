import { FC, useMemo } from 'react';

import { Alert, AlertProps } from '@mui/material';

import { QueryEnum } from 'core/enums/query.enums';
import { IExam } from 'core/interfaces/api/IExam';
import { queryClient } from 'core/services/queryClient';
import { RiskEnum } from 'project/enum/risk.enums';

import {
  EXAM_INCOMPATIBILITY_WARNING,
  isExamIncompatibleWithRiskType,
  isNr07Exam,
} from './exam-risk-applicability.util';

type ExamIncompatibilityAlertProps = {
  exam?: Partial<IExam> | null;
  riskType?: RiskEnum;
} & Pick<AlertProps, 'sx'>;

const resolveExamFromCache = (
  exam?: Partial<IExam> | null,
): Partial<IExam> | null | undefined => {
  if (!exam?.id || isNr07Exam(exam)) return exam;

  const queries = queryClient.getQueriesData<{ data?: IExam[] }>([
    QueryEnum.EXAMS,
  ]);

  for (const [, result] of queries) {
    const found = result?.data?.find((item) => item.id === exam.id);
    if (found) return { ...exam, ...found };
  }

  return exam;
};

export const ExamIncompatibilityAlert: FC<ExamIncompatibilityAlertProps> = ({
  exam,
  riskType,
  sx,
}) => {
  const resolvedExam = useMemo(() => resolveExamFromCache(exam), [exam]);

  if (!isExamIncompatibleWithRiskType(resolvedExam, riskType)) return null;

  return (
    <Alert severity="warning" sx={{ fontSize: 12, ...sx }}>
      {EXAM_INCOMPATIBILITY_WARNING}
    </Alert>
  );
};
