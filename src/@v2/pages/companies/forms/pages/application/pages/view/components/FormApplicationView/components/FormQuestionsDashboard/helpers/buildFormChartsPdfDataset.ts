import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

type ParticipantGroup = {
  id: string;
  name: string;
  participantIds: Set<string>;
};

type QuestionForChart = {
  id: string;
  groupId: string;
  groupName: string;
  details: { id: string; text: string; type: FormQuestionTypeEnum };
  options: { id: string; text: string; value?: number; order: number }[];
  answers: FormAnswerBrowseModel[];
};

type QuestionWithParticipantGroups = Omit<QuestionForChart, 'answers'> & {
  participantGroupData: Array<{
    groupId: string;
    groupName: string;
    participantCount: number;
    question: QuestionForChart;
  }>;
};

export type PieRowPdf = {
  optionLabel: string;
  count: number;
  percentage: number;
  optionValue?: number;
};

export type FormChartsPdfDataset = {
  grouping:
    | { active: false }
    | { active: true; questionId: string; questionLabel: string };
  participantGroups: Array<{
    id: string;
    name: string;
    participantCount: number;
  }>;
  identifierCharts: Array<{
    questionId: string;
    questionLabel: string;
    groupName: string;
    rows: PieRowPdf[];
    totalAnswers: number;
  }>;
  formGroups: Array<{
    groupId: string;
    groupName: string;
    questions: Array<{
      questionId: string;
      questionLabel: string;
      byParticipantGroup: Array<{
        participantGroupId: string;
        participantGroupName: string;
        participantCount: number;
        rows: PieRowPdf[];
        totalAnswers: number;
      }>;
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

/** Mesmo critério de `filterQuestionsWithOptions` no FormQuestionsDashboard (gráficos / indicadores). */
const buildQuestionsWithOptions = (
  groups: FormQuestionsAnswersBrowseModel['results'],
  filteredParticipantIds?: Set<string> | null,
): QuestionForChart[] => {
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
          ? filterAnswersByParticipants(question.answers, filteredParticipantIds)
          : question.answers,
      })),
  );
};

const buildParticipantGroups = (
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel,
  selectedGroupingQuestionId: string | null,
): {
  grouping: FormChartsPdfDataset['grouping'];
  participantGroups: ParticipantGroup[];
} => {
  const [identifierGroup] = formQuestionsAnswers.results;

  if (!identifierGroup) {
    return {
      grouping: { active: false },
      participantGroups: [
        {
          id: 'all',
          name: 'Todos os participantes',
          participantIds: new Set(),
        },
      ],
    };
  }

  const groupingQuestion = selectedGroupingQuestionId
    ? identifierGroup.questions.find((q) => q.id === selectedGroupingQuestionId)
    : null;

  if (!groupingQuestion) {
    const allParticipantIds = new Set<string>();
    identifierGroup.questions.forEach((q) => {
      q.answers.forEach((answer) => {
        allParticipantIds.add(answer.participantsAnswersId);
      });
    });

    return {
      grouping: { active: false },
      participantGroups: [
        {
          id: 'all',
          name: 'Todos os participantes',
          participantIds: allParticipantIds,
        },
      ],
    };
  }

  const participantGroups: ParticipantGroup[] = groupingQuestion.options.map(
    (option) => {
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
    },
  );

  return {
    grouping: {
      active: true,
      questionId: groupingQuestion.id,
      questionLabel: groupingQuestion.textWithoutHtml,
    },
    participantGroups,
  };
};

/**
 * Espelha FormQuestionPieChart: contagens por opção, só fatias com count > 0,
 * total = soma das fatias exibidas, percentual = Math.round(count/total*100) como no tooltip.
 */
function computePieRows(question: QuestionForChart): {
  rows: PieRowPdf[];
  totalAnswers: number;
} {
  const optionCounts = question.options.reduce(
    (acc, option) => {
      acc[option.id] = {
        id: option.id,
        label: option.text,
        value: 0,
        optionValue: option.value,
      };
      return acc;
    },
    {} as Record<
      string,
      { id: string; label: string; value: number; optionValue?: number }
    >,
  );

  question.answers.forEach((answer) => {
    answer.selectedOptionsIds.forEach((optionId) => {
      if (optionCounts[optionId]) {
        optionCounts[optionId].value += 1;
      }
    });
  });

  const pieData = Object.values(optionCounts).filter((item) => item.value > 0);
  const totalAnswers = pieData.reduce((sum, item) => sum + item.value, 0);
  const rows: PieRowPdf[] = pieData.map((item) => ({
    optionLabel: item.label,
    count: item.value,
    percentage:
      totalAnswers > 0 ? Math.round((item.value / totalAnswers) * 100) : 0,
    optionValue: item.optionValue,
  }));

  return { rows, totalAnswers };
}

export function buildFormChartsPdfDataset(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
}): FormChartsPdfDataset {
  const { formQuestionsAnswers, selectedGroupingQuestionId } = params;

  if (!formQuestionsAnswers || !Array.isArray(formQuestionsAnswers.results)) {
    throw new Error('Invalid formQuestionsAnswers payload: missing results array');
  }

  const { grouping, participantGroups } = buildParticipantGroups(
    formQuestionsAnswers,
    selectedGroupingQuestionId,
  );

  const [identifierGroup, ...generalGroups] = formQuestionsAnswers.results;

  const identifierQuestions = identifierGroup
    ? buildQuestionsWithOptions([identifierGroup])
    : [];

  const identifierCharts = identifierQuestions.map((q) => {
    const { rows, totalAnswers } = computePieRows(q);
    return {
      questionId: q.id,
      questionLabel: stripHtml(q.details.text),
      groupName: q.groupName,
      rows,
      totalAnswers,
    };
  });

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

  const formGroups = Object.values(questionsByFormGroup).map((fg) => ({
    groupId: fg.groupId,
    groupName: fg.groupName,
    questions: fg.questions.map((q) => ({
      questionId: q.id,
      questionLabel: stripHtml(q.details.text),
      byParticipantGroup: participantGroups.map((pg) => {
        const pdata = q.participantGroupData.find((p) => p.groupId === pg.id)
          ?.question;
        if (!pdata) {
          return {
            participantGroupId: pg.id,
            participantGroupName: pg.name,
            participantCount: pg.participantIds.size,
            rows: [] as PieRowPdf[],
            totalAnswers: 0,
          };
        }
        const { rows, totalAnswers } = computePieRows(pdata);
        return {
          participantGroupId: pg.id,
          participantGroupName: pg.name,
          participantCount: pg.participantIds.size,
          rows,
          totalAnswers,
        };
      }),
    })),
  }));

  return {
    grouping,
    participantGroups: participantGroups.map((pg) => ({
      id: pg.id,
      name: pg.name,
      participantCount: pg.participantIds.size,
    })),
    identifierCharts,
    formGroups,
  };
}
