import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import {
  coverageStatusLabels,
  coverageStatusTooltips,
  formatExamAge,
  formatExamEvents,
  formatExamPeriodicity,
  formatExamSex,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-display.util';
import { useFetchCompanyExamRiskCoverageDetail } from '@v2/services/medicine/company-exam-risk-coverage/hooks/useFetchCompanyExamRiskCoverageDetail';
import type { ICompanyExamRiskCoverageExamSummary } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  riskId: string | null;
  workspaceId?: string;
};

const ExamBlock: FC<{
  exam: ICompanyExamRiskCoverageExamSummary;
  badge: string;
  badgeColor?: 'success' | 'warning' | 'default' | 'info';
}> = ({ exam, badge, badgeColor = 'default' }) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 1.5,
      mb: 1,
    }}
  >
    <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
      <Typography fontWeight={600} fontSize={13}>
        {exam.examName}
      </Typography>
      <Chip size="small" label={badge} color={badgeColor} variant="outlined" />
    </Box>
    <Typography variant="caption" color="text.secondary" display="block">
      Eventos: {formatExamEvents(exam.config)}
    </Typography>
    <Typography variant="caption" color="text.secondary" display="block">
      Periodicidade: {formatExamPeriodicity(exam.config)} · Sexo:{' '}
      {formatExamSex(exam.config)} · Idade: {formatExamAge(exam.config)}
    </Typography>
    <Typography variant="caption" color="text.secondary" display="block">
      Intervalo: {exam.config?.considerBetweenDays ?? '—'} dias · Grau mín.:{' '}
      {exam.config?.minRiskDegree ?? '—'}
      {exam.config?.minRiskDegreeQuantity != null
        ? ` / qtd ${exam.config.minRiskDegreeQuantity}`
        : ''}
    </Typography>
    {exam.notes?.length ? (
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        Observações: {exam.notes.join(' · ')}
      </Typography>
    ) : null}
  </Box>
);

export const ExamRiskCoverageDetailDrawer: FC<Props> = ({
  open,
  onClose,
  companyId,
  riskId,
  workspaceId,
}) => {
  const { data, isLoading, isError } = useFetchCompanyExamRiskCoverageDetail(
    {
      companyId,
      riskId: riskId || '',
      workspaceId,
      onlyPcmso: true,
    },
    open && Boolean(companyId) && Boolean(riskId),
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 2 } }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
        <Box pr={1}>
          <Typography variant="h6" fontSize={16} fontWeight={700}>
            Cobertura de exames
            {data?.riskName ? ` — ${data.riskName}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Comparação read-only: Biblioteca recomenda; a empresa decide.
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Não foi possível carregar o detalhe da cobertura.</Alert>
      )}

      {!isLoading && data && (
        <Box>
          <Box mb={2}>
            <Typography variant="body2">
              Grupo: {data.riskGroup.name}
              {data.riskSubgroup ? ` · Subgrupo: ${data.riskSubgroup.name}` : ''}
            </Typography>
            <Typography variant="body2" fontWeight={600} mt={0.5}>
              Situação: {coverageStatusLabels[data.coverageStatus]}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {coverageStatusTooltips[data.coverageStatus]}
            </Typography>
            <Typography variant="caption" display="block" mt={0.75}>
              Adotados: {data.adoptedCount} · Recomendados: {data.recommendedCount} ·
              Pendentes: {data.missingCount} · Locais: {data.localOnlyCount}
            </Typography>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Exames adotados pela empresa
          </Typography>
          {data.adoptedExams.length === 0 ? (
            <Typography variant="body2" color="text.secondary" mb={2}>
              Nenhum exame vinculado atualmente.
            </Typography>
          ) : (
            data.adoptedExams.map((exam) => (
              <ExamBlock
                key={`adopted-${exam.examId}-${exam.linkId ?? 0}`}
                exam={exam}
                badge={
                  exam.isRecommendedByLibrary
                    ? 'Recomendado pela Biblioteca'
                    : 'Exclusivamente local'
                }
                badgeColor={exam.isRecommendedByLibrary ? 'success' : 'warning'}
              />
            ))
          )}

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Recomendações da Biblioteca
          </Typography>
          {data.recommendedExams.length === 0 ? (
            <Typography variant="body2" color="text.secondary" mb={2}>
              Não há regra ACTIVE aplicável a este risco.
            </Typography>
          ) : (
            data.recommendedExams.map((exam) => (
              <ExamBlock
                key={`rec-${exam.examId}`}
                exam={exam}
                badge={exam.isAdopted ? 'Já incorporado' : 'Ainda não incorporado'}
                badgeColor={exam.isAdopted ? 'success' : 'warning'}
              />
            ))
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            Biblioteca SimpleSST recomenda; a empresa decide. Use “Adotar padrão”
            ou “Completar cobertura” nos blocos de decisão para criar vínculos com
            pré-visualização e confirmação. A IA permanece opcional e não cria
            vínculos automaticamente.
          </Alert>
        </Box>
      )}
    </Drawer>
  );
};
