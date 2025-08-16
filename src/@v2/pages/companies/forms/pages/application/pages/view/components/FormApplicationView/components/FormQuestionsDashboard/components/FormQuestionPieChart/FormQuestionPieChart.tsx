import { Box, IconButton, Tooltip } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { ResponsivePie } from '@nivo/pie';
import { FormQuestionWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-with-answers-browse.model';
import { PieLegends } from './components/PieLegends/PieLegends';
import { HtmlContentRenderer } from '@v2/pages/companies/forms/pages/application/pages/public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

// Color mapping based on option values
const getColorByValue = (value?: number): string => {
  if (value === undefined || value === 0) {
    return '#9e9e9e'; // grey
  }

  if (value > 5) {
    return '#2196f3'; // blue
  }

  // Value-based color mapping for 1-5
  const valueColorMap: Record<number, string> = {
    5: '#3cbe7d',
    4: '#8fa728',
    3: '#d9d10b',
    2: '#d96c2f',
    1: '#F44336',
  };

  return valueColorMap[value] || '#9e9e9e'; // fallback to grey
};

// Color schemes for different sections
const colorSchemes = {
  identifier: [
    '#FF6B6B', // Bright red
    '#4ECDC4', // Teal
    '#FFEAA7', // Light yellow
    '#00c8f5', // Blue
    '#DDA0DD', // Plum
    '#F8C471', // Orange
    '#F7DC6F', // Golden yellow
    '#98D8C8', // Seafoam green
    '#BB8FCE', // Light purple
    '#85C1E9', // Sky blue
    '#96CEB4', // Mint green
    '#82E0AA', // Light green
  ],
};

interface FormQuestionPieChartProps {
  question: Omit<FormQuestionWithAnswersBrowseModel, 'textWithoutHtml'> & {
    groupName: string;
    groupId: string;
  };
  groupName?: string;
  colorScheme?: 'identifier' | 'general';
  hideQuestionText?: boolean;
  onCreateGroupAnalysis?: (questionId: string) => void;
}

export const FormQuestionPieChart = ({
  question,
  groupName,
  colorScheme = 'general',
  hideQuestionText = false,
  onCreateGroupAnalysis,
}: FormQuestionPieChartProps) => {
  // Get the appropriate color palette for identifier questions
  const identifierColors = colorSchemes.identifier;

  // Count answers for each option
  const optionCounts = question.options.reduce(
    (acc, option) => {
      acc[option.id] = {
        id: option.id,
        label: option.text,
        value: 0,
        optionValue: option.value, // Store the option value for color mapping
      };
      return acc;
    },
    {} as Record<
      string,
      { id: string; label: string; value: number; optionValue?: number }
    >,
  );

  // Count answers
  question.answers.forEach((answer) => {
    answer.selectedOptionsIds.forEach((optionId) => {
      if (optionCounts[optionId]) {
        optionCounts[optionId].value += 1;
      }
    });
  });

  // Convert to array and filter out options with 0 answers
  const pieData = Object.values(optionCounts)
    .filter((item) => item.value > 0)
    .map((item, index) => ({
      ...item,
      color:
        colorScheme === 'identifier'
          ? identifierColors[index % identifierColors.length]
          : getColorByValue(item.optionValue),
    }));

  // Function to create group analysis by each option
  const handleCreateGroupAnalysis = () => {
    onCreateGroupAnalysis?.(question.id);
  };

  // If no data, show a message
  if (pieData.length === 0) {
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

  const totalAnswers = pieData.reduce((sum, item) => sum + item.value, 0);

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
      <Box height={200} maxWidth={400} mx="auto">
        <ResponsivePie
          data={pieData}
          margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          innerRadius={0.5}
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          arcLinkLabel={(data) => `${data.label}`}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          colors={{ datum: 'data.color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#333333"
          enableArcLabels={true}
          enableArcLinkLabels={true}
          valueFormat={(value) => {
            const percentage = (value / totalAnswers) * 100;
            return percentage < 1 ? '<1%' : `${Math.round(percentage)}%`;
          }}
          tooltip={({ datum }) => (
            <Box
              sx={{
                background: 'white',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '300px',
                color: 'black',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <strong>{datum.label}</strong>
              <br />
              {datum.value} respostas (
              {Math.round((datum.value / totalAnswers) * 100)}%)
            </Box>
          )}
        />
      </Box>
      <PieLegends data={pieData} total={totalAnswers} />
    </Box>
  );
};
