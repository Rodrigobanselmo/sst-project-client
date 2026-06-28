import { FC } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material';
import { examRiskRuleSourceLabels } from '@v2/pages/master/exam-risk-rules/exam-risk-rule-labels';
import type { IAcgihBeiComparisonRow } from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';
import { ExamRiskRuleSourceEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

import { getComparisonReadiness } from '../acgih-bei-comparison-readiness';

type Props = {
  row: IAcgihBeiComparisonRow | null;
  isApplying: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const sourceLabel = (source: string | null): string => {
  if (!source) return '—';
  return (
    examRiskRuleSourceLabels[source as ExamRiskRuleSourceEnum] ?? source
  );
};

const InfoLine: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box display="flex" flexDirection="column">
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Box>
);

export const AcgihBeiAddReferenceDialog: FC<Props> = ({
  row,
  isApplying,
  onClose,
  onConfirm,
}) => {
  const acgihDetail = row
    ? [row.cas ? `CAS ${row.cas}` : null, row.determinant, row.biologicalMatrix]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <Dialog open={Boolean(row)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar fonte complementar</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          A ACGIH/BEI será registrada como fonte técnica complementar de uma
          regra <strong>já existente</strong>, reforçando a evidência da regra.
        </DialogContentText>

        {row && (
          <Box display="flex" flexDirection="column" gap={1.5}>
            <InfoLine
              label="Item ACGIH/BEI"
              value={[row.substanceName, acgihDetail]
                .filter(Boolean)
                .join(' — ')}
            />
            <Divider />
            <InfoLine
              label="Regra de destino"
              value={
                row.nr7IndicatorName ??
                row.examNameSnapshot ??
                'Regra existente resolvida pelo servidor'
              }
            />
            <InfoLine
              label="Origem principal da regra (não será alterada)"
              value={sourceLabel(row.examRiskRuleSource)}
            />

            {(() => {
              const chips = getComparisonReadiness(row);
              if (!chips.length) return null;
              return (
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Contexto/readiness
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {chips.map((chip) => (
                      <Tooltip key={chip.key} title={chip.tooltip ?? ''}>
                        <Chip
                          size="small"
                          variant="outlined"
                          color={chip.color}
                          label={chip.label}
                          sx={{ cursor: 'default' }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
              );
            })()}
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          Antes de registrar a ACGIH/BEI como fonte complementar, confirme se o
          item ACGIH/BEI está revisado/curado e se não há pendências relevantes
          na base NR-7 ou na regra da Biblioteca.
        </Alert>

        <Alert severity="info" sx={{ mt: 2 }}>
          Não será criada nova regra. Não haverá alteração em empresas, exames,
          XML, eSocial, S-2220/S-2240 ou PCMSO, nem nas bases NR-7 e ACGIH/BEI.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isApplying}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isApplying}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
