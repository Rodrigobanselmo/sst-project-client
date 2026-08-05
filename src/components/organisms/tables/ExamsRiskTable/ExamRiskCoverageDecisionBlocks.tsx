import { FC, useMemo, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ExamRiskCoverageDecisionGroupEnum,
  bucketCoverageItemsByDecision,
  decisionGroupTitles,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-decision.util';
import type { ICompanyExamRiskCoverageItem } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import { coverageStatusLabels } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-display.util';

type Props = {
  items: ICompanyExamRiskCoverageItem[];
  isLoading?: boolean;
  onViewCoverage: (riskId: string) => void;
  onAdoptStandard: (item: ICompanyExamRiskCoverageItem) => void;
  onCompleteCoverage: (item: ICompanyExamRiskCoverageItem) => void;
  onReviewWithAi: (item: ICompanyExamRiskCoverageItem) => void;
  onConfigureManually: (item: ICompanyExamRiskCoverageItem) => void;
};

const GROUP_ORDER: ExamRiskCoverageDecisionGroupEnum[] = [
  ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE,
  ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED,
  ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION,
  ExamRiskCoverageDecisionGroupEnum.LOCAL_ONLY,
];

const PRIMARY_GROUPS = new Set([
  ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE,
  ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED,
  ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION,
]);

const RiskMeta: FC<{ item: ICompanyExamRiskCoverageItem }> = ({ item }) => (
  <Typography variant="caption" color="text.secondary" display="block">
    {item.riskGroup.name}
    {item.riskSubgroup ? ` / ${item.riskSubgroup.name}` : ''}
  </Typography>
);

const RecommendationOrigin: FC<{ item: ICompanyExamRiskCoverageItem }> = ({
  item,
}) => (
  <Stack spacing={0.25}>
    <Typography variant="body2" fontWeight={600}>
      Biblioteca SimpleSST
    </Typography>
    <Typography variant="caption" color="text.secondary">
      Regra ACTIVE · {item.recommendedCount} exame(s) recomendado(s) ·{' '}
      {item.adoptedCount} adotado(s) · {item.missingCount} pendente(s)
    </Typography>
  </Stack>
);

const ActionButtons: FC<{
  group: ExamRiskCoverageDecisionGroupEnum;
  item: ICompanyExamRiskCoverageItem;
  onViewCoverage: () => void;
  onAdoptStandard: () => void;
  onCompleteCoverage: () => void;
  onReviewWithAi: () => void;
  onConfigureManually: () => void;
}> = ({
  group,
  item,
  onViewCoverage,
  onAdoptStandard,
  onCompleteCoverage,
  onReviewWithAi,
  onConfigureManually,
}) => {
  if (group === ExamRiskCoverageDecisionGroupEnum.LIBRARY_RECOMMENDATION_AVAILABLE) {
    return (
      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
        <Button size="small" variant="outlined" onClick={onViewCoverage}>
          Ver recomendação
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onAdoptStandard}
          disabled={!item.missingRecommendedExams.length}
        >
          Adotar padrão
        </Button>
        <Button
          size="small"
          variant="text"
          startIcon={<AutoAwesomeIcon fontSize="small" />}
          onClick={onReviewWithAi}
        >
          Revisar com IA
        </Button>
        <Button size="small" variant="text" onClick={onConfigureManually}>
          Configurar manualmente
        </Button>
      </Stack>
    );
  }

  if (group === ExamRiskCoverageDecisionGroupEnum.PARTIALLY_ADOPTED) {
    return (
      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
        <Button size="small" variant="outlined" onClick={onViewCoverage}>
          Ver pendências
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={onCompleteCoverage}
          disabled={!item.missingRecommendedExams.length}
        >
          Completar cobertura
        </Button>
        <Button
          size="small"
          variant="text"
          startIcon={<AutoAwesomeIcon fontSize="small" />}
          onClick={onReviewWithAi}
        >
          Revisar pendências com IA
        </Button>
        <Button size="small" variant="text" onClick={onViewCoverage}>
          Manter como está
        </Button>
        <Button size="small" variant="text" onClick={onConfigureManually}>
          Configurar manualmente
        </Button>
      </Stack>
    );
  }

  if (group === ExamRiskCoverageDecisionGroupEnum.NO_LIBRARY_RECOMMENDATION) {
    return (
      <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
        <Button
          size="small"
          variant="contained"
          startIcon={<AutoAwesomeIcon fontSize="small" />}
          onClick={onReviewWithAi}
        >
          Analisar com IA
        </Button>
        <Button size="small" variant="outlined" onClick={onConfigureManually}>
          Cadastrar manualmente
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
      <Button size="small" variant="outlined" onClick={onViewCoverage}>
        Ver vínculo
      </Button>
      <Button size="small" variant="outlined" onClick={onViewCoverage}>
        Revisar compatibilidade
      </Button>
      <Button
        size="small"
        variant="text"
        startIcon={<AutoAwesomeIcon fontSize="small" />}
        onClick={onReviewWithAi}
      >
        Revisar com IA
      </Button>
    </Stack>
  );
};

export const ExamRiskCoverageDecisionBlocks: FC<Props> = ({
  items,
  isLoading,
  onViewCoverage,
  onAdoptStandard,
  onCompleteCoverage,
  onReviewWithAi,
  onConfigureManually,
}) => {
  const buckets = useMemo(() => bucketCoverageItemsByDecision(items), [items]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    GROUP_ORDER.forEach((group) => {
      initial[group] = PRIMARY_GROUPS.has(group);
    });
    return initial;
  });

  const visibleGroups = GROUP_ORDER.filter(
    (group) => buckets[group].length > 0,
  );

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
        Carregando decisões de cobertura…
      </Typography>
    );
  }

  if (!visibleGroups.length) return null;

  return (
    <Box mt={2} mb={2} display="flex" flexDirection="column" gap={1}>
      <Typography variant="subtitle2" fontWeight={700}>
        Decisões de cobertura por risco
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        Biblioteca recomenda · Empresa decide · IA auxilia. Os blocos abaixo
        separam recomendações disponíveis, cobertura incompleta, ausência de
        padrão e vínculos exclusivamente locais.
      </Typography>

      {visibleGroups.map((group) => {
        const groupItems = buckets[group];
        const copy = decisionGroupTitles[group];
        const isOpen = expanded[group] ?? PRIMARY_GROUPS.has(group);

        return (
          <Accordion
            key={group}
            disableGutters
            expanded={isOpen}
            onChange={(_, next) =>
              setExpanded((current) => ({ ...current, [group]: next }))
            }
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {copy.title} ({groupItems.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {copy.subtitle}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fator de risco</TableCell>
                      <TableCell width={220}>Recomendação / origem</TableCell>
                      <TableCell width={160}>Cobertura</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupItems.map((item) => (
                      <TableRow key={item.riskId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {item.riskName}
                          </Typography>
                          <RiskMeta item={item} />
                        </TableCell>
                        <TableCell>
                          {item.hasAnyRecommendation ? (
                            <RecommendationOrigin item={item} />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sem regra ACTIVE na Biblioteca SimpleSST
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={coverageStatusLabels[item.coverageStatus]}
                            onClick={() => onViewCoverage(item.riskId)}
                            sx={{ fontWeight: 600, cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <ActionButtons
                            group={group}
                            item={item}
                            onViewCoverage={() => onViewCoverage(item.riskId)}
                            onAdoptStandard={() => onAdoptStandard(item)}
                            onCompleteCoverage={() => onCompleteCoverage(item)}
                            onReviewWithAi={() => onReviewWithAi(item)}
                            onConfigureManually={() =>
                              onConfigureManually(item)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};
