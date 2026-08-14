import { useMutation } from 'react-query';

import { copyExamRiskFromRisk } from '../company-exam-risk-copy-from-risk.service';
import type { IExamRiskCopyFromRiskParams } from '../company-exam-risk-copy-from-risk.types';

export const useMutateCopyExamRiskFromRisk = () =>
  useMutation((params: IExamRiskCopyFromRiskParams) =>
    copyExamRiskFromRisk(params),
  );
