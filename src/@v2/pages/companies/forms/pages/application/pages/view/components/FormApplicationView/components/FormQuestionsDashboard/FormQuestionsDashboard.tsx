import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Button, Chip, LinearProgress, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';
import { FormQuestionGroupWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-group-with-answers-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { HtmlContentRenderer } from '../../../../../public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { FormQuestionPieChart } from './components/FormQuestionPieChart/FormQuestionPieChart';
import { FormTextAnswers } from './components/FormTextAnswers/FormTextAnswers';
import { SectionHeader } from './components/SectionHeader/SectionHeader';
import { FormRisksAnalysis } from './components/FormRisksAnalysis/FormRisksAnalysis';
import { FormParticipantsTable } from '../FormParticipantsTable/FormParticipantsTable';

import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

// Types for the restructured data
interface QuestionWithParticipantGroups {
  id: string;
  groupId: string;
  groupName: string;
  details: {
    id: string;
    text: string;
    type: FormQuestionTypeEnum;
  };
  options: {
    id: string;
    text: string;
    value?: number;
    order: number;
  }[];
  participantGroupData: ParticipantGroupData[];
}

interface ParticipantGroupData {
  groupId: string;
  groupName: string;
  participantCount: number;
  question: any; // This will be the filtered question with answers
}

interface FormGroupWithQuestions {
  groupName: string;
  questions: QuestionWithParticipantGroups[];
}

// Group-Level Dashboard Indicator Component
interface GroupDashboardIndicatorProps {
  groupData: FormGroupWithQuestions;
  selectedGroupingQuestion?: string | null;
}

// Component for individual participant group indicator
interface ParticipantGroupIndicatorProps {
  groupData: FormGroupWithQuestions;
  participantGroupId: string;
  participantGroupName: string;
}

const ParticipantGroupIndicator = ({
  groupData,
  participantGroupId,
  participantGroupName,
}: ParticipantGroupIndicatorProps) => {
  // Calculate indicator value for specific participant group across all questions in this form group
  const calculateParticipantGroupIndicator = () => {
    let totalValue = 0;
    let totalAnswers = 0;

    // Sum across all questions in this group for the specific participant group
    groupData.questions.forEach((questionData) => {
      const participantData = questionData.participantGroupData.find(
        (pg) => pg.groupId === participantGroupId,
      );

      if (participantData) {
        participantData.question.answers.forEach((answer) => {
          answer.selectedOptionsIds.forEach((optionId) => {
            const option = questionData.options.find(
              (opt) => opt.id === optionId,
            );
            if (option && option.value !== undefined && option.value > 0) {
              totalValue += option.value - 1;
              totalAnswers += 1;
            }
          });
        });
      }
    });

    if (totalAnswers === 0) return 0;

    // Normalize by dividing by (number of answers × 5)
    const maxPossibleValue = totalAnswers * 4;
    return totalValue / maxPossibleValue;
  };

  const indicatorValue = calculateParticipantGroupIndicator();
  const percentage = Math.round(indicatorValue * 100);

  // Check if there are any valid answers for this participant group
  const hasValidAnswers = groupData.questions.some((questionData) => {
    const participantData = questionData.participantGroupData.find(
      (pg) => pg.groupId === participantGroupId,
    );

    return participantData?.question.answers.some((answer) =>
      answer.selectedOptionsIds.some((optionId) => {
        const option = questionData.options.find((opt) => opt.id === optionId);
        return option && option.value !== undefined && option.value > 0;
      }),
    );
  });

  // Get color based on indicator value
  const getIndicatorColor = (value: number): string => {
    if (value >= 0.8) return '#3cbe7d'; // Green for high scores
    if (value >= 0.6) return '#8fa728'; // Light green
    if (value >= 0.4) return '#d9d10b'; // Yellow
    if (value >= 0.2) return '#d96c2f'; // Orange
    return '#F44336'; // Red for low scores
  };

  return (
    <Box
      sx={{
        p: 2,
        px: 10,
        mb: 2,
        backgroundColor: 'secondary.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'secondary.200',
      }}
    >
      <Typography variant="h6" textAlign="center" mb={1} color="secondary.main">
        {participantGroupName}
      </Typography>

      <Box
        height={100}
        maxWidth={500}
        mx="auto"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {!hasValidAnswers ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mt={-20}
            height="100%"
            color="text.secondary"
          >
            <Typography variant="body2">No questions</Typography>
          </Box>
        ) : (
          <Box width="100%" mb={1}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getIndicatorColor(indicatorValue),
                  borderRadius: 6,
                },
              }}
            />
            <Typography
              variant="h4"
              textAlign="center"
              mt={1}
              color={getIndicatorColor(indicatorValue)}
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

const GroupDashboardIndicator = ({
  groupData,
  selectedGroupingQuestion,
}: GroupDashboardIndicatorProps) => {
  // Check if demographic grouping is active
  const hasMultipleParticipantGroups =
    groupData.questions.length > 0 &&
    groupData.questions[0].participantGroupData.length > 1;

  // If demographic grouping is active, show separate indicators for each participant group
  if (selectedGroupingQuestion && hasMultipleParticipantGroups) {
    // Get unique participant groups from the first question (they should be the same across all questions)
    const participantGroups = groupData.questions[0].participantGroupData;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" textAlign="center" mb={3} color="primary.main">
          Indicadores do Grupo: {groupData.groupName}
        </Typography>

        {/* Show indicators side by side for each participant group */}
        <SFlex
          gap={3}
          display="grid"
          px={10}
          gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        >
          {participantGroups.map((participantGroup) => (
            <ParticipantGroupIndicator
              key={participantGroup.groupId}
              groupData={groupData}
              participantGroupId={participantGroup.groupId}
              participantGroupName={participantGroup.groupName}
            />
          ))}
        </SFlex>
      </Box>
    );
  }

  // Default: show combined indicator for all participants
  const calculateGroupIndicator = () => {
    let totalValue = 0;
    let totalAnswers = 0;

    // Sum across all questions in this group and all their participant groups
    groupData.questions.forEach((questionData) => {
      questionData.participantGroupData.forEach((participantData) => {
        participantData.question.answers.forEach((answer) => {
          answer.selectedOptionsIds.forEach((optionId) => {
            const option = questionData.options.find(
              (opt) => opt.id === optionId,
            );
            if (option && option.value !== undefined && option.value > 0) {
              totalValue += option.value - 1;
              totalAnswers += 1;
            }
          });
        });
      });
    });

    if (totalAnswers === 0) return 0;

    // Normalize by dividing by (number of answers × 5)
    const maxPossibleValue = totalAnswers * 4;
    return totalValue / maxPossibleValue;
  };

  const indicatorValue = calculateGroupIndicator();
  const percentage = Math.round(indicatorValue * 100);

  // Check if there are any valid answers (value > 0) across all questions in this group
  const hasValidAnswers = groupData.questions.some((questionData) =>
    questionData.participantGroupData.some((participantData) =>
      participantData.question.answers.some((answer) =>
        answer.selectedOptionsIds.some((optionId) => {
          const option = questionData.options.find(
            (opt) => opt.id === optionId,
          );
          return option && option.value !== undefined && option.value > 0;
        }),
      ),
    ),
  );

  // Get color based on indicator value
  const getIndicatorColor = (value: number): string => {
    if (value >= 0.8) return '#3cbe7d'; // Green for high scores
    if (value >= 0.6) return '#8fa728'; // Light green
    if (value >= 0.4) return '#d9d10b'; // Yellow
    if (value >= 0.2) return '#d96c2f'; // Orange
    return '#F44336'; // Red for low scores
  };

  return (
    <SPaper
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 2,
        border: '2px solid',
        backgroundColor: 'grey.100',
        borderColor: getIndicatorColor(indicatorValue),
      }}
    >
      <Typography variant="h5" textAlign="center" mb={2} color="primary.main">
        Indicador do Grupo: {groupData.groupName}
      </Typography>

      <Box
        height={140}
        maxWidth={700}
        mx="auto"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box width="100%" mb={2}>
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
          <Typography
            variant="h2"
            textAlign="center"
            mt={2}
            color={getIndicatorColor(indicatorValue)}
          >
            {percentage}%
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            mt={1}
          >
            Score: {indicatorValue.toFixed(3)} | {groupData.questions.length}{' '}
            perguntas
          </Typography>
        </Box>
      </Box>
    </SPaper>
  );
};

interface FormQuestionsDashboardProps {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined;
  formApplication: FormApplicationReadModel;
}

export const FormQuestionsDashboard = ({
  formQuestionsAnswers,
  formApplication,
}: FormQuestionsDashboardProps) => {
  // Set initial tab based on shareableLink status
  const getInitialTab = () => {
    if (
      formApplication.isShareableLink ||
      formApplication.status === FormApplicationStatusEnum.DONE
    ) {
      return 1; // Gráficos tab
    } else {
      return 5; // Participantes tab
    }
  };

  const [tabTableIndex, setTabTableIndex] = useState<number>(getInitialTab());
  // State for managing selected identifier question for grouping
  const [selectedGroupingQuestion, setSelectedGroupingQuestion] = useState<
    string | null
  >(null);
  // State for controlling whether to show only group indicators or individual questions too
  const [showOnlyGroupIndicators, setShowOnlyGroupIndicators] =
    useState<boolean>(false);

  // Separate first group (identifier) from the rest (general questions)
  const [identifierGroup, ...generalGroups] =
    (formQuestionsAnswers?.results || [
      '',
    ]) as FormQuestionGroupWithAnswersBrowseModel[];

  // Get the selected grouping question
  const groupingQuestion = useMemo(() => {
    if (!selectedGroupingQuestion || !identifierGroup) return null;
    return identifierGroup.questions.find(
      (q) => q.id === selectedGroupingQuestion,
    );
  }, [selectedGroupingQuestion, identifierGroup]);

  // Create participant groups based on selected identifier question
  const participantGroups = useMemo(() => {
    if (!groupingQuestion) {
      // Default: all participants in one group
      const allParticipantIds = new Set<string>();
      if (identifierGroup) {
        identifierGroup.questions.forEach((question) => {
          question.answers.forEach((answer) => {
            allParticipantIds.add(answer.participantsAnswersId);
          });
        });
      }
      return [
        {
          id: 'all',
          name: 'Todos os participantes',
          participantIds: allParticipantIds,
        },
      ];
    }

    // Create groups for each option of the selected question
    return groupingQuestion.options.map((option) => {
      const participantIds = new Set<string>();
      groupingQuestion.answers.forEach((answer) => {
        if (answer.selectedOptionsIds.includes(option.id)) {
          participantIds.add(answer.participantsAnswersId);
        }
      });
      return {
        id: option.id,
        name: option.text,
        participantIds,
      };
    });
  }, [groupingQuestion, identifierGroup]);

  // Helper function to filter answers based on participant IDs
  const filterAnswersByParticipants = useCallback(
    (
      answers: FormAnswerBrowseModel[],
      participantIds: Set<string> | null,
    ): FormAnswerBrowseModel[] => {
      if (!participantIds) return answers;
      return answers.filter((answer) =>
        participantIds.has(answer.participantsAnswersId),
      );
    },
    [],
  );

  // Filter questions that can be displayed as pie charts (questions with options)
  const filterQuestionsWithOptions = useCallback(
    (
      groups: FormQuestionGroupWithAnswersBrowseModel[],
      filteredParticipantIds?: Set<string> | null,
    ) =>
      groups.flatMap((group) =>
        group.questions
          .filter(
            (question) =>
              question.options.length > 0 &&
              [
                FormQuestionTypeEnum.RADIO,
                FormQuestionTypeEnum.CHECKBOX,
                FormQuestionTypeEnum.SELECT,
              ].includes(question.details.type),
          )
          .map((question) => ({
            ...question,
            options: question.options.map((option) => ({
              ...option,
              value: option.value ? 6 - option.value : option.value,
              label: option.text,
            })),
            groupName: group.name,
            groupId: group.id,
            // Filter answers if participant IDs are provided
            answers: filteredParticipantIds
              ? filterAnswersByParticipants(
                  question.answers,
                  filteredParticipantIds,
                )
              : question.answers,
          })),
      ),
    [filterAnswersByParticipants],
  );

  // Handle group analysis creation (selecting a grouping question)
  const handleCreateGroupAnalysis = (questionId: string) => {
    setSelectedGroupingQuestion(questionId);
  };

  const identifierQuestions = identifierGroup
    ? filterQuestionsWithOptions([identifierGroup])
    : [];

  // Create array of arrays for general questions - one array per participant group
  const generalQuestionsArrays = useMemo(() => {
    return participantGroups.map((group) => {
      const questionsForGroup = filterQuestionsWithOptions(
        generalGroups,
        group.participantIds,
      );
      return {
        groupId: group.id,
        groupName: group.name,
        participantCount: group.participantIds.size,
        questions: questionsForGroup,
      };
    });
  }, [participantGroups, generalGroups, filterQuestionsWithOptions]);

  // Available identifier questions for grouping
  const availableGroupingQuestions = useMemo(() => {
    if (!identifierGroup) return [];

    return identifierGroup.questions.filter(
      (question) =>
        question.options.length > 0 &&
        [
          FormQuestionTypeEnum.RADIO,
          FormQuestionTypeEnum.CHECKBOX,
          FormQuestionTypeEnum.SELECT,
          FormQuestionTypeEnum.SYSTEM,
        ].includes(question.details.type),
    );
  }, [identifierGroup]);

  // Early return for loading state
  if (!formQuestionsAnswers) {
    return (
      <Box>
        <SSkeleton height={500} />
      </Box>
    );
  }

  const isShareableLink = formApplication.isShareableLink;

  if (
    isShareableLink &&
    identifierQuestions.length === 0 &&
    generalQuestionsArrays.every((group) => group.questions.length === 0)
  ) {
    return (
      <SFlex
        direction="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
      >
        <SPaper
          sx={{
            p: 6,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
          <InsertChartIcon
            sx={{
              fontSize: 64,
              color: '#9e9e9e',
              mb: 3,
            }}
          />
          <SText
            sx={{
              fontSize: 18,
              fontWeight: 500,
              color: '#616161',
              mb: 2,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Nenhuma resposta encontrada para exibir gráficos
          </SText>
          <SText
            sx={{
              fontSize: 14,
              color: '#9e9e9e',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Para visualizar gráficos, certifique-se de que seu formulário tenha
            sido compartilhado com sua empresa.
          </SText>
        </SPaper>
      </SFlex>
    );
  }

  const isPsychosocialForm =
    formApplication.form.type === FormTypeEnum.PSYCHOSOCIAL;
  const isDone = formApplication.status === FormApplicationStatusEnum.DONE;

  const showIdicators = isShareableLink || isDone;

  const isGraphsTab = tabTableIndex === 1;
  const isIndicatorTab = tabTableIndex === 2;
  const isTextAnswersTab = tabTableIndex === 3;
  const isRisksAnalysisTab = tabTableIndex === 4;
  const isParticipantsTab = tabTableIndex === 5;

  return (
    <SFlex direction="column" gap={16}>
      {/* Identifier Section */}
      {showIdicators && identifierQuestions.length > 0 && (
        <Box sx={{ p: 3 }}>
          <SectionHeader
            icon={<PersonIcon sx={{ fontSize: 30 }} />}
            title="Informações de Identificação"
          />
          <SPaper
            sx={{
              p: 3,
            }}
          >
            <SFlex
              gap={4}
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
            >
              {identifierQuestions.map((question) => (
                <Box key={question.id} p={4}>
                  <FormQuestionPieChart
                    question={question}
                    colorScheme="identifier"
                    onCreateGroupAnalysis={handleCreateGroupAnalysis}
                  />
                </Box>
              ))}
            </SFlex>
          </SPaper>
        </Box>
      )}

      {showIdicators && (
        <Box sx={{ p: 3 }}>
          {/* Grouping Section */}
          {availableGroupingQuestions.length > 0 &&
            generalQuestionsArrays.some(
              (group) => group.questions.length > 0,
            ) && (
              <Box>
                <SectionHeader
                  icon={<FilterListIcon sx={{ fontSize: 30 }} />}
                  title="Agrupar por Identificação"
                />
                <SPaper
                  sx={{
                    p: 10,
                  }}
                >
                  <SFlex direction="column" gap={3}>
                    {/* Grouping Controls */}
                    <Box>
                      <SSearchSelect
                        inputProps={{ sx: { width: 300 } }}
                        label="Selecionar pergunta para agrupar"
                        getOptionLabel={(option) => option.textWithoutHtml}
                        getOptionValue={(option) => option?.id}
                        onChange={(option) => {
                          setSelectedGroupingQuestion(option?.id || null);
                        }}
                        value={
                          availableGroupingQuestions.find(
                            (q) => q.id === selectedGroupingQuestion,
                          ) || null
                        }
                        options={availableGroupingQuestions}
                        placeholder="selecione uma pergunta de identificação..."
                      />
                    </Box>

                    {/* Selected Grouping Info */}
                    {selectedGroupingQuestion && groupingQuestion && (
                      <Box>
                        <Typography variant="body2" fontWeight="medium" mb={4}>
                          Agrupando por: {groupingQuestion.textWithoutHtml}
                        </Typography>
                        <SFlex gap={1} flexWrap="wrap">
                          {participantGroups.map((group) => (
                            <Chip
                              key={group.id}
                              label={`${group.name} (${group.participantIds.size} participantes)`}
                              color="default"
                              variant="outlined"
                            />
                          ))}
                        </SFlex>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<ClearIcon />}
                          onClick={() => setSelectedGroupingQuestion(null)}
                          sx={{ mt: 2 }}
                        >
                          Remover agrupamento
                        </Button>
                      </Box>
                    )}

                    {/* Participant Count */}
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {selectedGroupingQuestion
                          ? `Dados agrupados em ${participantGroups.length} grupos`
                          : `Total de ${participantGroups[0]?.participantIds.size || 0} participantes`}
                      </Typography>
                    </Box>
                  </SFlex>
                </SPaper>
              </Box>
            )}

          {/* Switch to toggle between showing individual questions and only group indicators */}
          {isIndicatorTab && (
            <SPaper
              sx={{
                mt: 5,
                p: 10,
                py: 5,
              }}
            >
              <Box sx={{ display: 'flex' }}>
                <SSwitch
                  label="Mostrar apenas indicadores de grupo"
                  value={showOnlyGroupIndicators}
                  onChange={(_, checked) => setShowOnlyGroupIndicators(checked)}
                  formControlProps={{
                    sx: {
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                    },
                  }}
                />
              </Box>
            </SPaper>
          )}
        </Box>
      )}

      {/* General Questions Section */}
      {(generalQuestionsArrays.some((group) => group.questions.length > 0) ||
        !isShareableLink) && (
        <Box sx={{ p: 3 }}>
          <SectionHeader
            icon={<InsertChartIcon sx={{ fontSize: 30 }} />}
            title={showIdicators ? 'Perguntas Gerais' : 'Participantes'}
          />
          <STabs
            options={[
              // Show these options only if shareableLink is true OR isDone is true
              ...(showIdicators
                ? [
                    {
                      label: 'Gráficos',
                      value: 1,
                    },
                    {
                      label: 'Indicadores',
                      value: 2,
                    },
                    {
                      label: 'Respostas de Texto',
                      value: 3,
                    },
                  ]
                : []),
              ...(isPsychosocialForm && isDone
                ? [
                    {
                      label: 'Análise de Riscos',
                      value: 4,
                    },
                  ]
                : []),
              // Show Participantes tab only if NOT shareableLink
              ...(!isShareableLink
                ? [
                    {
                      label: 'Participantes',
                      value: 5,
                    },
                  ]
                : []),
            ]}
            value={tabTableIndex}
            onChange={(_, value) => {
              setTabTableIndex(value);
              setShowOnlyGroupIndicators(false);
            }}
          />

          <SPaper
            sx={
              isParticipantsTab || isGraphsTab || isIndicatorTab
                ? {
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    WebkitBoxShadow: 'none',
                    outline: 'none',
                    p: 0,
                    mt: 10,
                  }
                : {}
            }
          >
            {isTextAnswersTab ? (
              <FormTextAnswers formGroups={generalGroups} />
            ) : isRisksAnalysisTab ? (
              <FormRisksAnalysis formApplication={formApplication} />
            ) : isParticipantsTab ? (
              <FormParticipantsTable
                companyId={formApplication.companyId}
                applicationId={formApplication.id}
                formApplication={formApplication}
              />
            ) : (
              <SFlex direction="column" gap={24} color="background.paper">
                {/* Create a structure grouped by questions first, then by participant groups */}
                {(() => {
                  // Get all unique questions across all participant groups
                  const allQuestions = new Map();

                  generalQuestionsArrays.forEach((participantGroup) => {
                    participantGroup.questions.forEach((question) => {
                      const key = `${question.groupId}-${question.id}`;
                      if (!allQuestions.has(key)) {
                        allQuestions.set(key, {
                          id: question.id,
                          groupId: question.groupId,
                          groupName: question.groupName,
                          details: question.details,
                          options: question.options,
                          participantGroupData: [],
                        });
                      }

                      // Add this participant group's data for this question
                      allQuestions.get(key).participantGroupData.push({
                        groupId: participantGroup.groupId,
                        groupName: participantGroup.groupName,
                        participantCount: participantGroup.participantCount,
                        question: question,
                      });
                    });
                  });

                  // Group questions by their original form groups
                  const questionsByFormGroup = Array.from(
                    allQuestions.values(),
                  ).reduce(
                    (acc, questionData) => {
                      const groupKey = questionData.groupId;
                      if (!acc[groupKey]) {
                        acc[groupKey] = {
                          groupName: questionData.groupName,
                          questions: [],
                        };
                      }
                      acc[groupKey].questions.push(questionData);
                      return acc;
                    },
                    {} as Record<string, FormGroupWithQuestions>,
                  );

                  return Object.entries(questionsByFormGroup).map(
                    ([groupId, groupData]) => {
                      const typedGroupData =
                        groupData as FormGroupWithQuestions;
                      return (
                        <Box key={groupId} mb={6}>
                          <SPaper>
                            <SText
                              sx={{
                                p: 8,
                                color: '#424242',
                                borderRadius: 1,
                                fontWeight: 600,
                                backgroundColor: 'grey.100',
                                fontSize: 18,
                                mb: 4,
                              }}
                            >
                              {typedGroupData.groupName}
                            </SText>
                          </SPaper>

                          {/* Group-Level Indicator - shows combined indicator for all questions in this group */}
                          {isIndicatorTab && (
                            <GroupDashboardIndicator
                              groupData={typedGroupData}
                              selectedGroupingQuestion={
                                selectedGroupingQuestion
                              }
                            />
                          )}

                          {/* Render each question with all its participant group variations side by side */}
                          {!showOnlyGroupIndicators &&
                            typedGroupData.questions.map(
                              (questionData: QuestionWithParticipantGroups) => (
                                <SPaper
                                  key={questionData.id}
                                  mb={6}
                                  px={8}
                                  py={8}
                                >
                                  <HtmlContentRenderer
                                    content={questionData.details.text}
                                  />
                                  <SDivider sx={{ mt: 8, mb: 4 }} />

                                  {/* Show all participant groups for this question side by side */}
                                  <SFlex
                                    gap={4}
                                    display="grid"
                                    gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
                                  >
                                    {questionData.participantGroupData.map(
                                      (
                                        participantData: ParticipantGroupData,
                                      ) => (
                                        <Box
                                          key={participantData.groupId}
                                          p={4}
                                        >
                                          <FormQuestionPieChart
                                            hideQuestionText
                                            groupName={
                                              participantData.groupName
                                            }
                                            question={participantData.question}
                                            colorScheme="general"
                                            indicators={isIndicatorTab}
                                          />
                                        </Box>
                                      ),
                                    )}
                                  </SFlex>
                                </SPaper>
                              ),
                            )}
                        </Box>
                      );
                    },
                  );
                })()}
              </SFlex>
            )}
          </SPaper>
        </Box>
      )}
    </SFlex>
  );
};
