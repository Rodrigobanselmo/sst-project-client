import { Box, LinearProgress, Typography } from '@mui/material';

import { buildConsolidatedChartQuestions } from '@v2/models/enterprise/company-group/consolidated-view-analytics.helpers';
import { IndicatorPercentScale } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/IndicatorPercentScale/IndicatorPercentScale';

type ConsolidatedChartQuestion = ReturnType<
  typeof buildConsolidatedChartQuestions
>[number];

type Props = {
  questions: ConsolidatedChartQuestion[];
  participantCount: number;
  isShareableLink?: boolean;
};

function getIndicatorColor(value: number): string {
  if (value >= 0.8) return '#3cbe7d';
  if (value >= 0.6) return '#8fa728';
  if (value >= 0.4) return '#d9d10b';
  if (value >= 0.2) return '#d96c2f';
  return '#F44336';
}

function calculateGroupIndicator(questions: ConsolidatedChartQuestion[]) {
  let totalValue = 0;
  let totalAnswers = 0;

  questions.forEach((question) => {
    question.answers.forEach((answer) => {
      answer.selectedOptionsIds.forEach((optionId) => {
        const option = question.options.find((opt) => opt.id === optionId);
        if (option && option.value !== undefined && option.value > 0) {
          totalValue += option.value - 1;
          totalAnswers += 1;
        }
      });
    });
  });

  if (totalAnswers === 0) return 0;

  return totalValue / (totalAnswers * 4);
}

function hasValidAnswers(questions: ConsolidatedChartQuestion[]) {
  return questions.some((question) =>
    question.answers.some((answer) =>
      answer.selectedOptionsIds.some((optionId) => {
        const option = question.options.find((opt) => opt.id === optionId);
        return option && option.value !== undefined && option.value > 0;
      }),
    ),
  );
}

export function ConsolidatedFormGroupIndicator({
  questions,
  participantCount,
  isShareableLink = false,
}: Props) {
  const shouldHideData = !isShareableLink && participantCount < 3;
  const indicatorValue = calculateGroupIndicator(questions);
  const percentage = Math.round(indicatorValue * 100);
  const validAnswers = hasValidAnswers(questions);

  return (
    <Box maxWidth={400} mx="auto" py={2}>
      {shouldHideData ? (
        <Box textAlign="center" px={2}>
          <Typography variant="h6" color="warning.main" fontWeight={500}>
            🔒 Dados Protegidos
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Para preservar a privacidade, os indicadores de setores com menos de
            3 respostas não são exibidos.
          </Typography>
        </Box>
      ) : !validAnswers ? (
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Nenhuma resposta encontrada ou sem relevância
          </Typography>
        </Box>
      ) : (
        <Box width="100%">
          <Typography variant="h6" textAlign="center" mb={1}>
            Indicador de Qualidade
          </Typography>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 20,
              borderRadius: 10,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getIndicatorColor(indicatorValue),
                borderRadius: 10,
              },
            }}
          />
          <IndicatorPercentScale />
          <Typography
            variant="h4"
            textAlign="center"
            mt={2}
            color={getIndicatorColor(indicatorValue)}
          >
            {percentage}%
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            Score: {indicatorValue.toFixed(3)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
