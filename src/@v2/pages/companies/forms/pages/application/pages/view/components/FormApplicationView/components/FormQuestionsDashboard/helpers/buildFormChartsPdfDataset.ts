import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

import { computePieDistributionRows } from './compute-pie-distribution-rows.util';
import {
  DEFAULT_FORM_CHART_TYPE,
  type FormChartType,
} from './form-chart-type.types';
import {
  buildParticipantGroupingForIndicatorsPdf,
  type HierarchyGroupForIndicators,
  type ParticipantGroupForIndicators,
} from './buildParticipantGroupsForIndicators';

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
  color?: string;
};

export type FormChartsPdfDataset = {
  chartType: FormChartType;
  isShareableLink: boolean; // Whether this is a shareable link (affects privacy hiding)
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
        shouldHideData: boolean; // Privacy protection: hide if <3 responses and not shareable link
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
          ? filterAnswersByParticipants(
              question.answers,
              filteredParticipantIds,
            )
          : question.answers,
      })),
  );
};

function toPieRowPdf(
  question: QuestionForChart,
  colorScheme: 'identifier' | 'general',
): { rows: PieRowPdf[]; totalAnswers: number } {
  const { rows, totalAnswers } = computePieDistributionRows({
    options: question.options,
    answers: question.answers,
    colorScheme,
  });

  return {
    rows: rows.map((row) => ({
      optionLabel: row.label,
      count: row.count,
      percentage: row.percentage,
      optionValue: row.optionValue,
      color: row.color,
    })),
    totalAnswers,
  };
}

export function buildFormChartsPdfDataset(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  selectedGroupingQuestionId: string | null;
  chartType?: FormChartType;
  isShareableLink: boolean;
  hierarchyGroups?: HierarchyGroupForIndicators[];
  /**
   * Quando o agrupamento por identificação está ativo, restringe quais grupos entram no PDF.
   * `undefined` = todos os grupos do agrupamento. Alinhado à tela e ao PDF de indicadores.
   */
  visibleParticipantGroupIds?: string[];
  /** Visão consolidada: agrupamento já resolvido fora do fluxo por aplicação. */
  participantGroupingOverride?: {
    grouping: FormChartsPdfDataset['grouping'];
    participantGroups: ParticipantGroupForIndicators[];
  };
}): FormChartsPdfDataset {
  const {
    formQuestionsAnswers,
    selectedGroupingQuestionId,
    chartType = DEFAULT_FORM_CHART_TYPE,
    isShareableLink,
    hierarchyGroups = [],
    visibleParticipantGroupIds,
    participantGroupingOverride,
  } = params;

  if (!formQuestionsAnswers || !Array.isArray(formQuestionsAnswers.results)) {
    throw new Error(
      'Invalid formQuestionsAnswers payload: missing results array',
    );
  }

  let { grouping, participantGroups } = participantGroupingOverride
    ? participantGroupingOverride
    : buildParticipantGroupingForIndicatorsPdf({
        formQuestionsAnswers,
        selectedGroupingQuestionId,
        hierarchyGroups,
      });

  if (grouping.active && visibleParticipantGroupIds !== undefined) {
    const allow = new Set(visibleParticipantGroupIds);
    participantGroups = participantGroups.filter((g) => allow.has(g.id));
  }

  const [identifierGroup, ...generalGroups] = formQuestionsAnswers.results;

  const identifierQuestions = identifierGroup
    ? buildQuestionsWithOptions([identifierGroup])
    : [];

  const identifierCharts = identifierQuestions.map((q) => {
    const { rows, totalAnswers } = toPieRowPdf(q, 'identifier');
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
        const pdata = q.participantGroupData.find(
          (p) => p.groupId === pg.id,
        )?.question;
        const participantCount = pg.participantIds.size;
        const shouldHideData = !isShareableLink && participantCount < 3;
        if (!pdata) {
          return {
            participantGroupId: pg.id,
            participantGroupName: pg.name,
            participantCount,
            rows: [] as PieRowPdf[],
            totalAnswers: 0,
            shouldHideData,
          };
        }
        const { rows, totalAnswers } = toPieRowPdf(pdata, 'general');
        return {
          participantGroupId: pg.id,
          participantGroupName: pg.name,
          participantCount,
          rows,
          totalAnswers,
          shouldHideData,
        };
      }),
    })),
  }));

  return {
    chartType,
    isShareableLink,
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
