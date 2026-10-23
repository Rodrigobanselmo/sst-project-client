import { useEffect, useRef, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { fetchCompanyExamRiskCoverageDetail } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.service';
import type {
  ICompanyExamRiskCoverageItem as Item,
  ICompanyExamRiskCoverageExamSummary as Exam,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  canAdoptCoverageExam,
  resolvePendingCoverageExam,
} from './exam-risk-adoption.util';

export type AdoptCoverageExam = (item: Item, exam: Exam) => void;
export function ExamRiskAdoptExam({
  companyId,
  workspaceId,
  riskId,
  exam,
  onAdopt,
}: {
  companyId: string;
  workspaceId?: string;
  riskId: string;
  exam?: Exam;
  onAdopt?: AdoptCoverageExam;
}) {
  const { isAuthSuccess } = useAuthShow();
  const authorized = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'c',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const busy = useRef(false);
  useEffect(
    () => () => {
      generation.current++;
      busy.current = false;
    },
    [companyId, workspaceId, riskId, exam?.examId],
  );
  if (!authorized || !onAdopt || !companyId || !canAdoptCoverageExam(exam))
    return null;
  const open = async () => {
    if (busy.current) return;
    busy.current = true;
    const request = generation.current;
    setLoading(true);
    setError('');
    try {
      const fresh = await fetchCompanyExamRiskCoverageDetail({
        companyId,
        workspaceId,
        riskId,
        onlyPcmso: true,
      });
      if (request !== generation.current) return;
      const pending = resolvePendingCoverageExam(fresh, riskId, exam!.examId);
      onAdopt(fresh, pending);
    } catch (cause) {
      if (request === generation.current)
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível carregar a recomendação. Tente novamente.',
        );
    } finally {
      if (request === generation.current) {
        busy.current = false;
        setLoading(false);
      }
    }
  };
  return (
    <>
      <Button
        size="small"
        color="success"
        startIcon={
          <span
            aria-hidden="true"
            style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' }}
          />
        }
        disabled={loading}
        sx={{ ml: 1, py: 0, textTransform: 'uppercase' }}
        aria-label={`Adotar exame ${exam!.examName}`}
        onClick={(event) => {
          event.stopPropagation();
          void open();
        }}
      >
        {loading ? 'Carregando…' : 'Adotar exame'}
      </Button>
      {error && (
        <Typography
          variant="caption"
          component="span"
          color="error"
          role="alert"
        >
          {error}
        </Typography>
      )}
    </>
  );
}
