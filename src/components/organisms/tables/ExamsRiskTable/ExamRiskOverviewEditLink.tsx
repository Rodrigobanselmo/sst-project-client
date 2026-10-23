import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import { queryExams } from 'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk';
import type { ICompanyExamRiskCoverageExamSummary } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

type Props = {
  companyId: string;
  workspaceId?: string;
  riskId: string;
  riskName: string;
  exam: ICompanyExamRiskCoverageExamSummary;
  label?: string;
  iconOnly?: boolean;
  onEdit: (link: IExamToRisk) => void;
};

export function ExamRiskOverviewEditLink({
  companyId,
  workspaceId,
  riskId,
  riskName,
  exam,
  label = exam.examName,
  onEdit,
  iconOnly = false,
}: Props) {
  const { isAuthSuccess } = useAuthShow();
  const authorized = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'u',
  });
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current += 1;
      busy.current = false;
    },
    [companyId, workspaceId, riskId, exam.linkId],
  );

  const open = async () => {
    if (!authorized || exam.linkId == null || busy.current) return;
    busy.current = true;
    const current = ++request.current;
    setLoading(true);
    setError('');
    try {
      // Fetch the complete legacy record; coverage does not contain every editor field.
      let skip = 0;
      while (true) {
        if (current !== request.current) return;
        const response = await queryExams(
          { skip, take: 100 },
          { companyId, workspaceId, riskNames: [riskName] },
        );
        if (current !== request.current) return;
        const link = response.data.find(
          (row) =>
            row.id === exam.linkId &&
            row.examId === exam.examId &&
            row.riskId === riskId,
        );
        if (link) {
          onEdit(link);
          return;
        }
        skip += response.data.length;
        if (!response.data.length || skip >= response.count) break;
      }
      throw new Error(
        'O vínculo não está disponível para edição. Atualize os dados e tente novamente.',
      );
    } catch {
      if (current === request.current)
        setError(
          'Não foi possível carregar este vínculo para edição. Tente novamente.',
        );
    } finally {
      if (current === request.current) {
        busy.current = false;
        setLoading(false);
      }
    }
  };

  if (!authorized || exam.linkId == null)
    return iconOnly ? null : <Typography variant="body2">{label}</Typography>;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        verticalAlign: 'middle',
        alignItems: 'flex-start',
      }}
    >
      <ButtonBase
        disabled={loading}
        aria-label={`Editar ${exam.examName}, vínculo ${exam.linkId}`}
        onClick={(event) => {
          event.stopPropagation();
          void open();
        }}
        sx={{
          textAlign: 'left',
          justifyContent: 'flex-start',
          font: 'inherit',
          fontWeight: 'inherit',
          borderRadius: 0.5,
          px: 0.5,
          mx: -0.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover', textDecoration: 'underline' },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
          },
        }}
      >
        {iconOnly ? <EditOutlinedIcon sx={{ fontSize: 16 }} /> : label}
        {loading && <CircularProgress size={14} sx={{ ml: 1 }} />}
      </ButtonBase>
      {error && (
        <Typography
          role="alert"
          variant="caption"
          color="error"
          display="block"
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
