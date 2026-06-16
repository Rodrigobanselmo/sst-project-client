import {
  Box,
  IconButton,
  Tooltip,
  LinearProgress,
  Typography,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { FormQuestionWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-with-answers-browse.model';
import { HtmlContentRenderer } from '@v2/pages/companies/forms/pages/application/pages/public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

import { calculateFormIndicatorFromQuestion } from '../../helpers/calculate-form-indicator.util';
import { computePieDistributionRows } from '../../helpers/compute-pie-distribution-rows.util';
import {
  DEFAULT_FORM_CHART_TYPE,
  type FormChartType,
} from '../../helpers/form-chart-type.types';
import {
  getIndicatorColorFromScore,
} from '../../helpers/form-indicator-quality.util';
import { FormChartDistributionView } from '../FormChartDistributionView/FormChartDistributionView';
import { IndicatorPercentScale } from '../IndicatorPercentScale/IndicatorPercentScale';

interface IndicatorComponentProps {
  question: Omit<FormQuestionWithAnswersBrowseModel, 'textWithoutHtml'> & {
    groupName: string;
    groupId: string;
  };
  groupName?: string;
  hideQuestionText?: boolean;
  onCreateGroupAnalysis?: (questionId: string) => void;
  isShareableLink?: boolean;
  participantCount?: number;
}

const IndicatorComponent = ({
  question,
  groupName,
  isShareableLink = true,
  participantCount,
}: IndicatorComponentProps) => {
  const uniqueParticipants = new Set(
    question.answers.map((answer) => answer.participantsAnswersId),
  ).size;

  const actualParticipantCount = participantCount ?? uniqueParticipants;
  const shouldHideData = !isShareableLink && actualParticipantCount < 3;

  const { score: indicatorValue, percentage, hasValidAnswers } =
    calculateFormIndicatorFromQuestion({
      answers: question.answers,
      options: question.options,
    });

  return (
    <Box>
      <SFlex justifyContent="space-between" alignItems="center" mb={8}>
        {groupName && (
          <SText
            textAlign={'center'}
            width="100%"
            fontWeight="bold"
            fontSize={16}
          >
            {groupName}
          </SText>
        )}
      </SFlex>

      <Box
        maxWidth={400}
        mx="auto"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {shouldHideData ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="text.secondary"
            textAlign="center"
            mt={10}
            px={2}
          >
            <Typography variant="h6" color="warning.main" fontWeight={500}>
              🔒 Dados Protegidos
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Para preservar a privacidade, os indicadores de setores com menos
              de 3 respostas não são exibidos.
            </Typography>
          </Box>
        ) : !hasValidAnswers ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="text.secondary"
            mt={10}
          >
            <Typography variant="h6">
              Nenhuma resposta encontrada ou sem relevância
            </Typography>
          </Box>
        ) : (
          <Box width="100%" mb={2}>
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
                  backgroundColor: getIndicatorColorFromScore(indicatorValue),
                  borderRadius: 10,
                },
              }}
            />
            <IndicatorPercentScale />
            <Typography
              variant="h4"
              textAlign="center"
              mt={2}
              color={getIndicatorColorFromScore(indicatorValue)}
            >
              {percentage}%
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
            >
              Score: {indicatorValue.toFixed(3)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface FormQuestionPieChartProps {
  question: Omit<FormQuestionWithAnswersBrowseModel, 'textWithoutHtml'> & {
    groupName: string;
    groupId: string;
  };
  groupName?: string;
  colorScheme?: 'identifier' | 'general';
  chartType?: FormChartType;
  hideQuestionText?: boolean;
  onCreateGroupAnalysis?: (questionId: string) => void;
  indicators?: boolean;
  isShareableLink?: boolean;
  participantCount?: number;
}

export const FormQuestionPieChart = ({
  question,
  groupName,
  colorScheme = 'general',
  chartType = DEFAULT_FORM_CHART_TYPE,
  hideQuestionText = false,
  indicators = false,
  onCreateGroupAnalysis,
  isShareableLink = true,
  participantCount,
}: FormQuestionPieChartProps) => {
  const uniqueParticipants = new Set(
    question.answers.map((answer) => answer.participantsAnswersId),
  ).size;

  const actualParticipantCount = participantCount ?? uniqueParticipants;
  const shouldHideData = !isShareableLink && actualParticipantCount < 3;

  const { rows, totalAnswers } = computePieDistributionRows({
    options: question.options,
    answers: question.answers,
    colorScheme,
  });

  const handleCreateGroupAnalysis = () => {
    onCreateGroupAnalysis?.(question.id);
  };

  if (indicators) {
    return (
      <IndicatorComponent
        question={question}
        groupName={groupName}
        isShareableLink={isShareableLink}
        participantCount={actualParticipantCount}
      />
    );
  }

  if (shouldHideData) {
    return (
      <Box>
        {groupName && (
          <SText textAlign="center" fontWeight="bold" fontSize={16} mb={2}>
            {groupName}
          </SText>
        )}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={200}
          color="text.secondary"
          textAlign="center"
          px={2}
        >
          <Typography variant="body1" color="warning.main" fontWeight={500}>
            🔒 Dados Protegidos
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Para preservar a privacidade, os gráficos de setores com menos de 3
            respostas não são exibidos.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box>
        {groupName && (
          <SText textAlign="center" fontWeight="bold" fontSize={16}>
            {groupName}
          </SText>
        )}
        {!hideQuestionText && (
          <Box mb={2}>
            <HtmlContentRenderer content={question.details.text} />
          </Box>
        )}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height={200}
          color="text.secondary"
        >
          Nenhuma resposta encontrada
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <SFlex justifyContent="space-between" alignItems="center" mb={8}>
        {groupName && (
          <SText
            textAlign={'center'}
            width="100%"
            fontWeight="bold"
            fontSize={16}
          >
            {groupName}
          </SText>
        )}
        {onCreateGroupAnalysis && (
          <Tooltip title="Criar análise por grupos desta pergunta">
            <IconButton
              onClick={handleCreateGroupAnalysis}
              size="small"
              sx={{
                ml: 2,
                mt: -2,
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                },
              }}
            >
              <AnalyticsIcon />
            </IconButton>
          </Tooltip>
        )}
        {!hideQuestionText && (
          <Box flex={1}>
            <HtmlContentRenderer content={question.details.text} />
          </Box>
        )}
      </SFlex>
      <Box maxWidth={400} mx="auto">
        <FormChartDistributionView
          rows={rows}
          totalAnswers={totalAnswers}
          chartType={chartType}
        />
      </Box>
    </Box>
  );
};
