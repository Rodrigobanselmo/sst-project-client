import { useEffect, useState } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ExamRiskRuleFormModal } from '@v2/pages/master/exam-risk-rules/components/ExamRiskRuleFormModal';
import { examRiskRuleQueryKeys } from '@v2/services/medicine/exam-risk-rule/hooks/exam-risk-rule.query-keys';
import { getExamRiskRuleById } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.service';
import type { ICompanyExamRiskCoverageExamSummary as Exam } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import { hasSemiannualStandard } from './exam-risk-library-parameter.util';

export function ExamRiskOverviewEditLibrary({ exam, onSaved }: {
  exam: Exam;
  onSaved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const source = exam.recommendationSource!;
  const { data, isFetching, isError } = useQuery({
    queryKey: [...examRiskRuleQueryKeys.detail(source.ruleId), 'full-editor'],
    queryFn: () => getExamRiskRuleById(source.ruleId),
    enabled: open,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [rule, setRule] = useState<typeof data>();
  useEffect(() => {
    if (open && !rule && !isFetching && !isError && data) setRule(data);
  }, [open, rule, isFetching, isError, data]);

  const close = () => {
    setOpen(false);
    setRule(undefined);
  };
  const canEdit = rule?.exams.some((item) => item.id === source.ruleExamId);

  return (
    <>
      <Tooltip title="Editar padrão da Biblioteca">
        <IconButton
          size="small"
          aria-label={`Editar padrão da Biblioteca de ${exam.examName}`}
          onClick={(event) => {
            event.stopPropagation();
            setRefreshError(false);
            setOpen(true);
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      {open && rule && canEdit ? (
        <ExamRiskRuleFormModal
          open
          rule={rule}
          onClose={close}
          comparisonItemId={source.ruleExamId}
          semiannualStandard={hasSemiannualStandard(exam.config)}
          onSaved={() => {
            close();
            void onSaved().catch(() => setRefreshError(true));
          }}
        />
      ) : open && (
        <Dialog open onClose={close}>
          <DialogTitle>Editar padrão da Biblioteca</DialogTitle>
          <DialogContent>
            {isError || rule
              ? 'Não foi possível localizar esta recomendação. Atualize a comparação e tente novamente.'
              : 'Carregando regra…'}
          </DialogContent>
          <DialogActions><Button onClick={close}>Fechar</Button></DialogActions>
        </Dialog>
      )}
      {refreshError && <Alert severity="warning">Regra salva. Atualize a página para recarregar a comparação.</Alert>}
    </>
  );
}
