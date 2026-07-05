import { FC } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { IApplyExamRiskRulePcmsoDefaultsResult } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

type Props = {
  result: IApplyExamRiskRulePcmsoDefaultsResult | null;
  onClose: () => void;
};

export const ExamRiskRuleApplyPcmsoDefaultsResultDialog: FC<Props> = ({
  result,
  onClose,
}) => {
  if (!result) return null;

  const { totals, updated, skipped, warnings } = result;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resultado da aplicação</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={1.5}>
          <Typography variant="subtitle2">Totais</Typography>
          <Typography variant="body2">
            Regras solicitadas: <b>{totals.requestedRules}</b>
          </Typography>
          <Typography variant="body2">
            Regras atualizadas: <b>{totals.updatedRules}</b>
          </Typography>
          <Typography variant="body2">
            Exames atualizados: <b>{totals.updatedExams}</b>
          </Typography>
          <Typography variant="body2">
            Quantitativo aplicado: <b>{totals.quantitativeApplied}</b>
          </Typography>
          <Typography variant="body2">
            Quantitativo não aplicável: <b>{totals.quantitativeNotApplicable}</b>
          </Typography>
          <Typography variant="body2">
            Regras ignoradas: <b>{totals.skippedRules}</b>
          </Typography>

          {updated.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                Regras atualizadas
              </Typography>
              {updated.map((item) => (
                <Typography key={item.ruleId} variant="body2">
                  {item.ruleName} ({item.status}) — {item.examsUpdated} exame(s)
                  {item.quantitativeApplied
                    ? ' · quantitativo aplicado'
                    : ''}
                </Typography>
              ))}
            </Box>
          )}

          {skipped.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                Regras ignoradas
              </Typography>
              {skipped.map((item) => (
                <Typography key={item.ruleId} variant="body2">
                  {item.ruleId}: {item.reason}
                </Typography>
              ))}
            </Box>
          )}

          {warnings.length > 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2" gutterBottom>
                Avisos
              </Typography>
              {warnings.map((warning, index) => (
                <Alert key={index} severity="warning" sx={{ mb: 0.5 }}>
                  {warning}
                </Alert>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
