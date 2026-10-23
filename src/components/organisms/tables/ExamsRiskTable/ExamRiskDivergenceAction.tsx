import { Button, Tooltip } from '@mui/material';
import type { ExamRiskParameterReview } from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.types';

export function ExamRiskDivergenceAction({
  review,
  canUpdate,
  pending,
  label,
  onAction,
}: {
  review?: ExamRiskParameterReview;
  canUpdate: boolean;
  pending: boolean;
  label: string;
  onAction: (action: 'ACCEPT' | 'REOPEN') => void;
}) {
  const accepted = review?.state === 'ACCEPTED';
  if (
    !canUpdate ||
    !review ||
    !(accepted
      ? review.canReopen
      : review.state === 'UNREVIEWED' && review.canReview)
  )
    return null;
  const text = accepted ? 'Reabrir avaliação' : 'Aceitar divergência';
  return (
    <Tooltip
      title={
        accepted
          ? 'Retirar a aceitação desta diferença, sem alterar os parâmetros.'
          : 'Registrar esta diferença como conhecida e aceita. Não significa conformidade com a Biblioteca.'
      }
    >
      <span>
        <Button
          size="small"
          variant="text"
          color={accepted ? 'info' : 'inherit'}
          disabled={pending}
          aria-label={`${text} — ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onAction(accepted ? 'REOPEN' : 'ACCEPT');
          }}
          sx={{
            ml: 1,
            px: 0.5,
            py: 0,
            minWidth: 0,
            fontSize: '0.7rem',
            textTransform: 'none',
            verticalAlign: 'middle',
          }}
        >
          {text}
        </Button>
      </span>
    </Tooltip>
  );
}
