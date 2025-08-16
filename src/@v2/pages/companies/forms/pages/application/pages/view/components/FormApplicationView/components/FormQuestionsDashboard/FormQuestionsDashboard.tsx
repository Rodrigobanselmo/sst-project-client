import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Button, Chip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';
import { FormQuestionGroupWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-group-with-answers-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { HtmlContentRenderer } from '../../../../../public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { FormQuestionPieChart } from './components/FormQuestionPieChart/FormQuestionPieChart';
import { SectionHeader } from './components/SectionHeader/SectionHeader';

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

interface FormQuestionsDashboardProps {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined;
  formApplication: FormApplicationReadModel;
}

export const FormQuestionsDashboard = ({
  formQuestionsAnswers,
  formApplication,
}: FormQuestionsDashboardProps) => {
  // State for managing selected identifier question for grouping
  const [selectedGroupingQuestion, setSelectedGroupingQuestion] = useState<
    string | null
  >(null);

  // Separate first group (identifier) from the rest (general questions)
  const [identifierGroup, ...generalGroups] = formQuestionsAnswers?.results || [
    undefined,
  ];

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
        generalGroups.filter(
          Boolean,
        ) as FormQuestionGroupWithAnswersBrowseModel[],
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

  if (
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

  return (
    <SFlex direction="column" gap={16}>
      {/* Identifier Section */}
      {identifierQuestions.length > 0 && (
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

      {/* Grouping Section */}
      {identifierQuestions.length > 0 &&
        generalQuestionsArrays.some((group) => group.questions.length > 0) && (
          <Box sx={{ p: 3 }}>
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
                  {/* <Autocomplete
                    options={availableGroupingQuestions}
                    getOptionLabel={(option) => option.textWithoutHtml}
                    onChange={(_, value) => {
                      setSelectedGroupingQuestion(value?.id || null);
                    }}
                    value={
                      availableGroupingQuestions.find(
                        (q) => q.id === selectedGroupingQuestion,
                      ) || null
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                  /> */}
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

      {/* General Questions Section */}
      {generalQuestionsArrays.some((group) => group.questions.length > 0) && (
        <Box sx={{ p: 3 }}>
          <SectionHeader
            icon={<InsertChartIcon sx={{ fontSize: 30 }} />}
            title="Perguntas Gerais"
          />
          <SPaper>
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
                    const typedGroupData = groupData as FormGroupWithQuestions;
                    return (
                      <Box key={groupId} mb={6}>
                        <SText
                          sx={{
                            p: 8,
                            color: '#424242',
                            fontWeight: 600,
                            backgroundColor: 'grey.200',
                            fontSize: 18,
                            borderBottom: '2px solid',
                            borderTop: '2px solid',
                            borderColor: 'grey.300',
                            mb: 4,
                          }}
                        >
                          {typedGroupData.groupName}
                        </SText>

                        {/* Render each question with all its participant group variations side by side */}
                        {typedGroupData.questions.map(
                          (questionData: QuestionWithParticipantGroups) => (
                            <Box key={questionData.id} mb={6} px={8}>
                              <HtmlContentRenderer
                                content={questionData.details.text}
                              />

                              {/* Show all participant groups for this question side by side */}
                              <SFlex
                                gap={4}
                                display="grid"
                                gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
                              >
                                {questionData.participantGroupData.map(
                                  (participantData: ParticipantGroupData) => (
                                    <Box key={participantData.groupId} p={4}>
                                      <FormQuestionPieChart
                                        hideQuestionText
                                        groupName={participantData.groupName}
                                        question={participantData.question}
                                        colorScheme="general"
                                      />
                                    </Box>
                                  ),
                                )}
                              </SFlex>
                            </Box>
                          ),
                        )}
                      </Box>
                    );
                  },
                );
              })()}
            </SFlex>
          </SPaper>
        </Box>
      )}
    </SFlex>
  );
};
