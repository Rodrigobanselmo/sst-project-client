import InsertChartIcon from '@mui/icons-material/InsertChart';
import PersonIcon from '@mui/icons-material/Person';
import { Box } from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { FormQuestionPieChart } from './components/FormQuestionPieChart/FormQuestionPieChart';
import { SectionHeader } from './components/SectionHeader/SectionHeader';

interface FormQuestionsDashboardProps {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel | null | undefined;
  formApplication: FormApplicationReadModel;
}

export const FormQuestionsDashboard = ({
  formQuestionsAnswers,
  formApplication,
}: FormQuestionsDashboardProps) => {
  if (!formQuestionsAnswers) {
    return (
      <Box>
        <SSkeleton height={500} />
      </Box>
    );
  }

  // Separate first group (identifier) from the rest (general questions)
  const [identifierGroup, ...generalGroups] = formQuestionsAnswers.results;

  // Filter questions that can be displayed as pie charts (questions with options)
  const filterQuestionsWithOptions = (
    groups: typeof formQuestionsAnswers.results,
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
        })),
    );

  const identifierQuestions = identifierGroup
    ? filterQuestionsWithOptions([identifierGroup])
    : [];
  const generalQuestions = filterQuestionsWithOptions(generalGroups);

  // Group questions by group for general questions
  const generalQuestionsByGroup = generalQuestions.reduce(
    (acc, question) => {
      const groupKey = question.groupId;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          groupName: question.groupName,
          questions: [],
        };
      }
      acc[groupKey].questions.push(question);
      return acc;
    },
    {} as Record<
      string,
      { groupName: string; questions: typeof generalQuestions }
    >,
  );

  if (identifierQuestions.length === 0 && generalQuestions.length === 0) {
    return (
      <Box>
        <p>Nenhuma pergunta com opções encontrada para exibir gráficos.</p>
      </Box>
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
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
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
                  />
                </Box>
              ))}
            </SFlex>
          </SPaper>
        </Box>
      )}
      {/* General Questions Section */}
      {generalQuestions.length > 0 && (
        <Box sx={{ p: 3 }}>
          <SectionHeader
            icon={<InsertChartIcon sx={{ fontSize: 30 }} />}
            title="Perguntas Gerais"
          />
          <SPaper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <SFlex direction="column" gap={24} color="background.paper">
              {Object.entries(generalQuestionsByGroup).map(
                ([groupId, groupData]) => (
                  <Box key={groupId}>
                    <SText
                      sx={{
                        p: 4,
                        color: '#424242',
                        fontWeight: 600,
                        fontSize: 18,
                        borderBottom: '2px solid #e3f2fd',
                        pb: 2,
                        mb: 3,
                      }}
                    >
                      {groupData.groupName}
                    </SText>
                    <SFlex
                      gap={6}
                      display="grid"
                      gridTemplateColumns="repeat(auto-fit, minmax(400px, 1fr))"
                    >
                      {groupData.questions.map((question) => (
                        <Box key={question.id} p={4}>
                          <FormQuestionPieChart
                            key={question.id}
                            question={question}
                            colorScheme="general"
                          />
                        </Box>
                      ))}
                    </SFlex>
                  </Box>
                ),
              )}
            </SFlex>
          </SPaper>
        </Box>
      )}
    </SFlex>
  );
};
