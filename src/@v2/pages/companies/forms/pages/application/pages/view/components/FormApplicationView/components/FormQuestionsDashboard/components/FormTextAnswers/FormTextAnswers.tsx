import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { useState, useMemo } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormQuestionGroupWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-group-with-answers-browse.model';
import { FormQuestionWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-with-answers-browse.model';
import { HtmlContentRenderer } from '../../../../../../../public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';

interface FormTextAnswersProps {
  formGroups: FormQuestionGroupWithAnswersBrowseModel[];
}

interface TextQuestion {
  id: string;
  groupId: string;
  groupName: string;
  question: FormQuestionWithAnswersBrowseModel;
}

interface TextAnswer {
  id: string;
  value: string;
  participantId: string;
}

export const FormTextAnswers = ({ formGroups }: FormTextAnswersProps) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );

  // Filter questions that are text-based (SHORT_TEXT, LONG_TEXT, TEXT)
  const textQuestions = useMemo(() => {
    const questions: TextQuestion[] = [];

    formGroups.forEach((group) => {
      group.questions.forEach((question) => {
        if (
          [
            FormQuestionTypeEnum.SHORT_TEXT,
            FormQuestionTypeEnum.LONG_TEXT,
            FormQuestionTypeEnum.TEXT,
          ].includes(question.details.type)
        ) {
          questions.push({
            id: question.id,
            groupId: group.id,
            groupName: group.name,
            question,
          });
        }
      });
    });

    return questions;
  }, [formGroups]);

  // Get selected question data
  const selectedQuestion = useMemo(() => {
    if (!selectedQuestionId) return null;
    return textQuestions.find((q) => q.id === selectedQuestionId);
  }, [selectedQuestionId, textQuestions]);

  // Get text answers for selected question
  const textAnswers = useMemo(() => {
    if (!selectedQuestion) return [];

    const answers: TextAnswer[] = [];
    selectedQuestion.question.answers.forEach((answer) => {
      if (answer.value && answer.value.trim()) {
        answers.push({
          id: answer.id,
          value: answer.value,
          participantId: answer.participantsAnswersId,
        });
      }
    });

    return answers;
  }, [selectedQuestion]);

  // Auto-select first question if none selected
  if (!selectedQuestionId && textQuestions.length > 0) {
    setSelectedQuestionId(textQuestions[0].id);
  }

  if (textQuestions.length === 0) {
    return (
      <SFlex
        direction="column"
        alignItems="center"
        justifyContent="center"
        width="100%"
        p={12}
      >
        <SPaper
          sx={{
            p: 12,
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
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
            Nenhuma pergunta de texto encontrada
          </SText>
          <SText
            sx={{
              fontSize: 14,
              color: '#9e9e9e',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Este formulário não possui perguntas de texto (resposta curta ou
            longa).
          </SText>
        </SPaper>
      </SFlex>
    );
  }

  return (
    <SFlex direction="row" height="600px" gap={0}>
      {/* Sidebar with questions */}
      <Box
        sx={{
          width: 350,
          borderRight: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 1,
          backgroundColor: 'grey.50',
        }}
      >
        <Box sx={{ p: 4, borderBottom: '1px solid', borderColor: 'grey.300' }}>
          <Typography variant="h6" color="text.label">
            Perguntas de Texto ({textQuestions.length})
          </Typography>
        </Box>

        <List sx={{ p: 0, maxHeight: 'calc(600px - 80px)', overflow: 'auto' }}>
          {textQuestions.map((textQuestion, index) => (
            <Box key={textQuestion.id}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedQuestionId === textQuestion.id}
                  onClick={() => setSelectedQuestionId(textQuestion.id)}
                  sx={{
                    py: 4,
                    px: 6,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.50',
                      borderRight: '3px solid',
                      borderRightColor: 'primary.main',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontSize={12}
                        >
                          {textQuestion.groupName}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {textQuestion.question.textWithoutHtml}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {
                            textQuestion.question.answers.filter(
                              (a) => a.value && a.value.trim(),
                            ).length
                          }{' '}
                          respostas
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < textQuestions.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>

      {/* Main content area with answers */}
      <Box sx={{ flex: 1, p: 6, overflow: 'auto', maxHeight: '600px' }}>
        {selectedQuestion ? (
          <Box>
            {/* Question header */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {selectedQuestion.groupName}
              </Typography>
              <HtmlContentRenderer
                content={selectedQuestion.question.details.text}
              />
              <Typography variant="body2" color="text.secondary" mt={4}>
                {textAnswers.length} respostas encontradas
              </Typography>
            </Box>

            {/* Answers list */}
            {textAnswers.length > 0 ? (
              <Box>
                {textAnswers.map((answer, index) => (
                  <Paper
                    key={answer.id}
                    sx={{
                      p: 6,
                      mb: 4,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Participante #{index + 1}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {answer.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            ) : (
              <SPaper
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: 'grey.50',
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Nenhuma resposta encontrada para esta pergunta
                </Typography>
              </SPaper>
            )}
          </Box>
        ) : (
          <SPaper
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: 'grey.50',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Selecione uma pergunta para ver as respostas
            </Typography>
          </SPaper>
        )}
      </Box>
    </SFlex>
  );
};
