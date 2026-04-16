import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

import {
  buildParticipantGroupingForIndicatorsPdf,
  type HierarchyGroupForIndicators,
} from './buildParticipantGroupsForIndicators';

type QuestionForIndicator = {
  id: string;
  groupId: string;
  groupName: string;
  details: { id: string; text: string; type: FormQuestionTypeEnum };
  options: { id: string; text: string; value?: number; order: number }[];
  answers: FormAnswerBrowseModel[];
};

type QuestionWithParticipantGroups = Omit<QuestionForIndicator, 'answers'> & {
  participantGroupData: Array<{
    groupId: string;
    groupName: string;
    participantCount: number;
    question: QuestionForIndicator;
  }>;
};

export type IndicatorRowPdf = {
  participantGroupId: string;
  participantGroupName: string;
  participantCount: number;
  score: number;
  percentage: number;
  hasValidAnswers: boolean;
  shouldHideData: boolean; // Privacy protection: hide if <3 responses and not shareable link
};

export type IndicatorsPdfDataset = {
  /** Alinhado ao toggle da aba Indicadores: só categorias vs categorias + perguntas. */
  showOnlyGroupIndicators: boolean;
  isShareableLink: boolean; // Whether this is a shareable link (affects privacy hiding)
  grouping:
    | { active: false }
    | { active: true; questionId: string; questionLabel: string };
  participantGroups: Array<{
    id: string;
    name: string;
    participantCount: number;
  }>;
  formGroups: Array<{
    groupId: string;
    groupName: string;
    indicators: IndicatorRowPdf[];
    questions?: Array<{
      questionId: string;
      questionLabel: string;
      indicators: IndicatorRowPdf[];
    }>;
  }>;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/g, '').trim();
}

const filterAnswersByParticipants = (
  answers: FormAnswerBrowseModel[],
  participantIds: Set<string> | null,
) => {
  if (!participantIds) return answers;
  return answers.filter((answer) =>
    participantIds.has(answer.participantsAnswersId),
  );
};

const buildQuestionsWithOptions = (
  groups: FormQuestionsAnswersBrowseModel['results'],
  filteredParticipantIds?: Set<string> | null,
): QuestionForIndicator[] => {
  return groups.flatMap((group) =>
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
        id: question.id,
        groupId: group.id,
        groupName: group.name,
        details: question.details,
        options: question.options.map((option) => ({
          ...option,
          value: option.value ? 6 - option.value : option.value,
        })),
        answers: filteredParticipantIds
          ? filterAnswersByParticipants(
              question.answers,
              filteredParticipantIds,
            )
          : question.answers,
      })),
  );
};

const calculateIndicatorForQuestions = (
  questions: QuestionWithParticipantGroups[],
  participantGroupId?: string,
) => {
  let totalValue = 0;
  let totalAnswers = 0;

  questions.forEach((questionData) => {
    const questionsToAggregate = participantGroupId
      ? ([
          questionData.participantGroupData.find(
            (pg) => pg.groupId === participantGroupId,
          )?.question,
        ].filter(Boolean) as QuestionForIndicator[])
      : questionData.participantGroupData.map((pg) => pg.question);

    questionsToAggregate.forEach((q) => {
      q.answers.forEach((answer) => {
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

  if (totalAnswers === 0)
    return { score: 0, percentage: 0, hasValidAnswers: false };

  const maxPossibleValue = totalAnswers * 4;
  const score = maxPossibleValue > 0 ? totalValue / maxPossibleValue : 0;
  const percentage = Math.round(score * 100);

  return { score, percentage, hasValidAnswers: true };
};

export function buildIndicatorsPdfDataset(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
  showOnlyGroupIndicators: boolean;
  isShareableLink: boolean;
  /** Mesmos grupos hierárquicos da tela (opcional; default []). */
  hierarchyGroups?: HierarchyGroupForIndicators[];
}): IndicatorsPdfDataset {
  const {
    formQuestionsAnswers,
    selectedGroupingQuestionId,
    showOnlyGroupIndicators,
    isShareableLink,
    hierarchyGroups = [],
  } = params;

  if (!formQuestionsAnswers || !Array.isArray(formQuestionsAnswers.results)) {
    throw new Error(
      'Invalid formQuestionsAnswers payload: missing results array',
    );
  }

  const { grouping, participantGroups } =
    buildParticipantGroupingForIndicatorsPdf({
      formQuestionsAnswers,
      selectedGroupingQuestionId,
      hierarchyGroups,
    });

  const [, ...generalGroups] = formQuestionsAnswers.results;

  const generalQuestionsArrays = participantGroups.map((group) => ({
    groupId: group.id,
    groupName: group.name,
    participantCount: group.participantIds.size,
    questions: buildQuestionsWithOptions(generalGroups, group.participantIds),
  }));

  const allQuestions = new Map<string, QuestionWithParticipantGroups>();

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

      allQuestions.get(key)!.participantGroupData.push({
        groupId: participantGroup.groupId,
        groupName: participantGroup.groupName,
        participantCount: participantGroup.participantCount,
        question,
      });
    });
  });

  const questionsByFormGroup = Array.from(allQuestions.values()).reduce(
    (acc, questionData) => {
      const groupKey = questionData.groupId;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          groupId: questionData.groupId,
          groupName: questionData.groupName,
          questions: [] as QuestionWithParticipantGroups[],
        };
      }
      acc[groupKey].questions.push(questionData);
      return acc;
    },
    {} as Record<
      string,
      {
        groupId: string;
        groupName: string;
        questions: QuestionWithParticipantGroups[];
      }
    >,
  );

  const hasMultipleParticipantGroups =
    grouping.active && participantGroups.length > 1;

  const formGroups = Object.values(questionsByFormGroup).map((fg) => {
    const indicators = (
      hasMultipleParticipantGroups ? participantGroups : [participantGroups[0]]
    ).map((pg) => {
      const { score, percentage, hasValidAnswers } =
        calculateIndicatorForQuestions(
          fg.questions,
          hasMultipleParticipantGroups ? pg.id : undefined,
        );
      const participantCount = pg.participantIds.size;
      const shouldHideData = !isShareableLink && participantCount < 3;
      return {
        participantGroupId: pg.id,
        participantGroupName: pg.name,
        participantCount,
        score,
        percentage,
        hasValidAnswers,
        shouldHideData,
      };
    });

    const questions = showOnlyGroupIndicators
      ? undefined
      : fg.questions.map((q) => ({
          questionId: q.id,
          questionLabel: stripHtml(q.details.text),
          indicators: (hasMultipleParticipantGroups
            ? participantGroups
            : [participantGroups[0]]
          ).map((pg) => {
            const { score, percentage, hasValidAnswers } =
              calculateIndicatorForQuestions(
                [q],
                hasMultipleParticipantGroups ? pg.id : undefined,
              );
            const participantCount = pg.participantIds.size;
            const shouldHideData = !isShareableLink && participantCount < 3;
            return {
              participantGroupId: pg.id,
              participantGroupName: pg.name,
              participantCount,
              score,
              percentage,
              hasValidAnswers,
              shouldHideData,
            };
          }),
        }));

    return {
      groupId: fg.groupId,
      groupName: fg.groupName,
      indicators,
      ...(questions ? { questions } : {}),
    };
  });

  return {
    showOnlyGroupIndicators,
    isShareableLink,
    grouping,
    participantGroups: participantGroups.map((pg) => ({
      id: pg.id,
      name: pg.name,
      participantCount: pg.participantIds.size,
    })),
    formGroups,
  };
}
