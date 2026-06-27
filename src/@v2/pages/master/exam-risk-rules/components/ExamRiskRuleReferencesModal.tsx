import { FC, useState } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutateDeleteExamRiskRuleReference } from '@v2/services/medicine/exam-risk-rule/hooks/useMutateExamRiskRule';
import type {
  IExamRiskRule,
  IExamRiskRuleReference,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

type Props = {
  rule: IExamRiskRule | null;
  onClose: () => void;
};

const sourceTypeLabels: Record<string, string> = {
  ACGIH_BEI: 'ACGIH/BEI',
  NR_07: 'NR-07',
  SIMPLE_SST: 'SimpleSST',
  TECHNICAL: 'Critério técnico',
  OTHER: 'Outro',
};

export const ExamRiskRuleReferencesModal: FC<Props> = ({ rule, onClose }) => {
  const [toRemove, setToRemove] = useState<IExamRiskRuleReference | null>(null);
  const deleteMutation = useMutateDeleteExamRiskRuleReference();

  const references = rule?.references ?? [];

  const handleRemove = (reference: IExamRiskRuleReference) => {
    if (!rule || deleteMutation.isPending) return;
    setToRemove(reference);
    deleteMutation.mutate(
      { ruleId: rule.id, referenceId: reference.id },
      { onSettled: () => setToRemove(null) },
    );
  };

  return (
    <Dialog open={Boolean(rule)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Fontes complementares da regra</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Evidências técnicas que reforçam a regra. A origem principal não é
          alterada e nenhuma remoção aqui afeta empresas, exames, XML, eSocial
          ou PCMSO.
        </DialogContentText>

        {references.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nenhuma fonte complementar registrada nesta regra.
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {references.map((reference) => {
              const isRemoving =
                deleteMutation.isPending && toRemove?.id === reference.id;
              return (
                <Box
                  key={reference.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        size="small"
                        color="secondary"
                        variant="outlined"
                        label={
                          sourceTypeLabels[reference.sourceType] ??
                          reference.sourceType
                        }
                      />
                      {reference.referenceYear && (
                        <Typography variant="caption" color="text.secondary">
                          {reference.referenceYear}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2">
                      {reference.referenceLabel ?? '—'}
                    </Typography>
                  </Box>
                  <Tooltip title="Remover fonte complementar">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={isRemoving}
                        onClick={() => handleRemove(reference)}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
