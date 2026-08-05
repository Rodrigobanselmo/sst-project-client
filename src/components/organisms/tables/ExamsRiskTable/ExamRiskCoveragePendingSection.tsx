import { FC } from 'react';

import {
  Alert,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { CoverageStatusChip } from './CoverageStatusChip';
import type { ICompanyExamRiskCoverageItem } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

type Props = {
  items: ICompanyExamRiskCoverageItem[];
  isLoading?: boolean;
  isError?: boolean;
  onOpenRisk: (riskId: string) => void;
};

export const ExamRiskCoveragePendingSection: FC<Props> = ({
  items,
  isLoading,
  isError,
  onOpenRisk,
}) => {
  if (isError) {
    return (
      <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
        Não foi possível carregar as pendências de cobertura por risco.
      </Alert>
    );
  }

  const pendingWithoutLink = items.filter(
    (item) => item.hasAnyRecommendation && !item.hasAnyAdoptedExam,
  );
  const otherPending = items.filter(
    (item) => !(item.hasAnyRecommendation && !item.hasAnyAdoptedExam),
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        mb: 2,
        p: 2,
        borderColor: 'warning.light',
        bgcolor: '#FFFBF5',
      }}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        Lista 1 — Riscos sem cobertura completa
      </Typography>
      <Typography variant="body2" color="text.secondary" display="block" mb={1.5}>
        Riscos caracterizados neste estabelecimento com recomendações ainda não
        incorporadas (incluindo riscos sem nenhum vínculo ExamToRisk). Esta lista é
        independente da tabela de vínculos abaixo.
      </Typography>

      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Carregando cobertura…
        </Typography>
      )}

      {!isLoading && items.length === 0 && (
        <Alert severity="success" sx={{ py: 0.5 }}>
          Nenhuma pendência de cobertura neste estabelecimento.
        </Alert>
      )}

      {!isLoading && pendingWithoutLink.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={700} color="error.main" mb={0.5}>
            Sem nenhum exame adotado ({pendingWithoutLink.length})
          </Typography>
          <List dense disablePadding>
            {pendingWithoutLink.map((item) => (
              <ListItemButton
                key={item.riskId}
                onClick={() => onOpenRisk(item.riskId)}
                sx={{ borderRadius: 1, px: 1 }}
              >
                <ListItemText
                  primary={item.riskName}
                  secondary={`${item.riskGroup.name}${
                    item.riskSubgroup ? ` · ${item.riskSubgroup.name}` : ''
                  } · ${item.missingCount} pendente(s)`}
                  primaryTypographyProps={{ fontSize: 13 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
                <CoverageStatusChip item={item} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}

      {!isLoading && otherPending.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="warning.main"
            mb={0.5}
          >
            Cobertura parcial ou exclusivamente local ({otherPending.length})
          </Typography>
          <List dense disablePadding>
            {otherPending.map((item) => (
              <ListItemButton
                key={item.riskId}
                onClick={() => onOpenRisk(item.riskId)}
                sx={{ borderRadius: 1, px: 1 }}
              >
                <ListItemText
                  primary={item.riskName}
                  secondary={`${item.riskGroup.name}${
                    item.riskSubgroup ? ` · ${item.riskSubgroup.name}` : ''
                  } · adotados ${item.adoptedCount} · pendentes ${item.missingCount}`}
                  primaryTypographyProps={{ fontSize: 13 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
                <CoverageStatusChip item={item} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};
