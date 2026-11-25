import { Box, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useMemo } from 'react';

import { SAccordion } from '@v2/components/organisms/SAccordion/SAccordion';
import { SAccordionBody } from '@v2/components/organisms/SAccordion/components/SAccordionBody/SAccordionBody';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormQuestionGroupWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-group-with-answers-browse.model';
import { HtmlContentRenderer } from '../../../../../../../public/answer/components/HtmlContentRenderer/FormAnswerFieldControlled';
import { formAccordionNavigationSx } from '../../../form-accordion-navigation.styles';

interface FormTextAnswersProps {
  formGroups: FormQuestionGroupWithAnswersBrowseModel[];
}

export const FormTextAnswers = ({ formGroups }: FormTextAnswersProps) => {
  const textQuestions = useMemo(
    () =>
      formGroups.flatMap((group) =>
        group.questions
          .filter((question) =>
            [
              FormQuestionTypeEnum.SHORT_TEXT,
              FormQuestionTypeEnum.LONG_TEXT,
              FormQuestionTypeEnum.TEXT,
            ].includes(question.details.type),
          )
          .map((question) => ({
            groupName: group.name,
            question,
            answers: question.answers.filter(
              (answer) => answer.value && answer.value.trim(),
            ),
          })),
      ),
    [formGroups],
  );

  if (!textQuestions.length)
    return (
      <Box sx={{ py: 8, px: 6 }}>
        <Typography color="text.primary" fontWeight={600}>
          Nenhuma pergunta de texto encontrada
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
          Este formulário não possui perguntas de texto (resposta curta ou
          longa).
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ px: 6, mb: 6 }}>
        {textQuestions.length}{' '}
        {textQuestions.length === 1
          ? 'pergunta de texto'
          : 'perguntas de texto'}{' '}
        ·{' '}
        {textQuestions.reduce((total, item) => total + item.answers.length, 0)}{' '}
        respostas
      </Typography>
      {textQuestions.map(({ groupName, question, answers }, questionIndex) => (
        <SAccordion
          key={question.id}
          defaultExpanded={questionIndex === 0}
          expandIcon={<ArrowRightIcon fontSize="small" />}
          accordionProps={{
            sx: {
              ...formAccordionNavigationSx,
              backgroundColor: 'transparent',
              border: 0,
              boxShadow: 'none',
              WebkitBoxShadow: 'none',
              '&::before': { display: 'none' },
            },
          }}
          title={
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pergunta {questionIndex + 1} · {groupName} · {answers.length}{' '}
                respostas
              </Typography>
              <Box
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  overflowWrap: 'anywhere',
                }}
              >
                <HtmlContentRenderer
                  useThemeTextColor
                  content={question.details.text}
                />
              </Box>
            </Box>
          }
        >
          <SAccordionBody>
            <Box sx={{ pl: { xs: 4, sm: 12 }, pr: 6, pt: 4 }}>
              {answers.length ? (
                answers.map((answer, answerIndex) => (
                  <Box
                    component="details"
                    open
                    key={answer.id}
                    sx={{
                      py: 5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      minWidth: 0,
                      '& > summary': {
                        cursor: 'pointer',
                        color: 'text.primary',
                        fontWeight: 600,
                        fontSize: '14px',
                      },
                      '& > summary:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        outlineOffset: 3,
                      },
                    }}
                  >
                    <Box component="summary">Resposta {answerIndex + 1}</Box>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      sx={{
                        mt: 3,
                        pl: 8,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        lineHeight: 1.7,
                      }}
                    >
                      {answer.value}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 6 }}
                >
                  Nenhuma resposta encontrada para esta pergunta.
                </Typography>
              )}
            </Box>
          </SAccordionBody>
        </SAccordion>
      ))}
    </Box>
  );
};
