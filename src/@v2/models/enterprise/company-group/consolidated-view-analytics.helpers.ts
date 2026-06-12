import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import {
  getStructuralIndicatorGroupingConfig,
  STRUCTURAL_INDICATOR_GROUPING_CONFIGS,
  StructuralIndicatorGroupingKey,
} from '@v2/models/form/helpers/form-indicators-structural-grouping.config';
import { FormAnswerBrowseModel } from '@v2/models/form/models/form-questions-answers/form-answer-browse.model';
import { FormParticipantStructureBrowseModel } from '@v2/models/form/models/form-questions-answers/form-participant-structure-browse.model';
import { FormQuestionGroupWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-group-with-answers-browse.model';
import { FormQuestionWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-with-answers-browse.model';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import type { ParticipantGroupForIndicators } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildParticipantGroupsForIndicators';

import { CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE } from './consolidated-view-participants.helpers';

export const CONSOLIDATED_ANALYTICS_COMPANY_GROUPING_KEY =
  '__consolidated_company';

export const CONSOLIDATED_ANALYTICS_STRUCTURAL_GROUPING_KEYS = [
  CONSOLIDATED_ANALYTICS_COMPANY_GROUPING_KEY,
  '__participant_workspace',
  '__participant_sector',
  '__participant_directory',
  '__participant_management',
] as const;

export type ConsolidatedAnalyticsStructuralGroupingKey =
  (typeof CONSOLIDATED_ANALYTICS_STRUCTURAL_GROUPING_KEYS)[number];

export type ConsolidatedAnalyticsGroupingMode =
  | 'overview'
  | ConsolidatedAnalyticsStructuralGroupingKey
  | `question:${string}`;

export type ConsolidatedAnalyticsFilters = {
  groupingMode: ConsolidatedAnalyticsGroupingMode;
};

export function isConsolidatedStructuralGroupingKey(
  value: string,
): value is ConsolidatedAnalyticsStructuralGroupingKey {
  return (CONSOLIDATED_ANALYTICS_STRUCTURAL_GROUPING_KEYS as readonly string[]).includes(
    value,
  );
}

export function shouldProtectConsolidatedAnalyticsGroup(count: number) {
  return count > 0 && count < CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE;
}

export function buildConsolidatedCompanyParticipantGroups(
  participantStructures: FormParticipantStructureBrowseModel[],
): ParticipantGroupForIndicators[] {
  const groupsMap = new Map<string, ParticipantGroupForIndicators>();

  for (const structure of participantStructures) {
    const companyId = structure.companyId ?? '__none__';
    const companyName = structure.companyName?.trim() || 'Sem empresa';
    const groupId = `${CONSOLIDATED_ANALYTICS_COMPANY_GROUPING_KEY}::${companyId}`;

    let group = groupsMap.get(groupId);
    if (!group) {
      group = {
        id: groupId,
        name: companyName,
        participantIds: new Set<string>(),
      };
      groupsMap.set(groupId, group);
    }

    group.participantIds.add(structure.participantsAnswersId);
  }

  return Array.from(groupsMap.values())
    .filter((group) => group.participantIds.size > 0)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

export function buildConsolidatedStructuralParticipantGroups(params: {
  participantStructures: FormParticipantStructureBrowseModel[];
  groupingKey: ConsolidatedAnalyticsStructuralGroupingKey;
}): ParticipantGroupForIndicators[] {
  if (params.groupingKey === CONSOLIDATED_ANALYTICS_COMPANY_GROUPING_KEY) {
    return buildConsolidatedCompanyParticipantGroups(params.participantStructures);
  }

  const config = getStructuralIndicatorGroupingConfig(
    params.groupingKey as StructuralIndicatorGroupingKey,
  );

  if (!config) return [];

  const groupsMap = new Map<string, ParticipantGroupForIndicators>();

  for (const structure of params.participantStructures) {
    const { groupId, groupName } = config.resolveGroup(structure);
    let group = groupsMap.get(groupId);

    if (!group) {
      group = {
        id: groupId,
        name: groupName,
        participantIds: new Set<string>(),
      };
      groupsMap.set(groupId, group);
    }

    group.participantIds.add(structure.participantsAnswersId);
  }

  return Array.from(groupsMap.values())
    .filter((group) => group.participantIds.size > 0)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

export function buildConsolidatedIdentificationParticipantGroups(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  questionId: string;
}): ParticipantGroupForIndicators[] {
  const [identifierGroup] = params.formQuestionsAnswers.results;
  const groupingQuestion = identifierGroup?.questions.find(
    (question) => question.id === params.questionId,
  );

  if (!groupingQuestion) return [];

  const groupsMap = new Map<string, ParticipantGroupForIndicators>();

  for (const answer of groupingQuestion.answers) {
    for (const optionId of answer.selectedOptionsIds) {
      const option = groupingQuestion.options.find((item) => item.id === optionId);
      if (!option) continue;

      const groupId = `question:${params.questionId}::${optionId}`;
      let group = groupsMap.get(groupId);

      if (!group) {
        group = {
          id: groupId,
          name: option.text.replace(/<[^>]*>?/g, '').trim() || '—',
          participantIds: new Set<string>(),
        };
        groupsMap.set(groupId, group);
      }

      group.participantIds.add(answer.participantsAnswersId);
    }
  }

  return Array.from(groupsMap.values())
    .filter((group) => group.participantIds.size > 0)
    .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

export function buildConsolidatedAnalyticsParticipantGroups(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  groupingMode: ConsolidatedAnalyticsGroupingMode;
}): ParticipantGroupForIndicators[] {
  if (params.groupingMode === 'overview') {
    const participantIds = new Set(
      params.formQuestionsAnswers.participantStructures.map(
        (structure) => structure.participantsAnswersId,
      ),
    );

    return [
      {
        id: 'overview',
        name: 'Visão geral consolidada',
        participantIds,
      },
    ];
  }

  if (params.groupingMode.startsWith('question:')) {
    const questionId = params.groupingMode.replace('question:', '');
    return buildConsolidatedIdentificationParticipantGroups({
      formQuestionsAnswers: params.formQuestionsAnswers,
      questionId,
    });
  }

  if (isConsolidatedStructuralGroupingKey(params.groupingMode)) {
    return buildConsolidatedStructuralParticipantGroups({
      participantStructures: params.formQuestionsAnswers.participantStructures,
      groupingKey: params.groupingMode,
    });
  }

  return [];
}

function filterAnswersByParticipants(
  answers: FormAnswerBrowseModel[],
  participantIds: Set<string> | null,
) {
  if (!participantIds) return answers;

  return answers.filter((answer) =>
    participantIds.has(answer.participantsAnswersId),
  );
}

export function buildConsolidatedChartQuestions(
  groups: FormQuestionGroupWithAnswersBrowseModel[],
  filteredParticipantIds?: Set<string> | null,
) {
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
        ...question,
        options: question.options.map((option) => ({
          ...option,
          value: option.value ? 6 - option.value : option.value,
          label: option.text,
        })),
        groupName: group.name,
        groupId: group.id,
        answers: filteredParticipantIds
          ? filterAnswersByParticipants(question.answers, filteredParticipantIds)
          : question.answers,
      })),
  );
}

export function getConsolidatedDemographicQuestions(
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel,
) {
  const [identifierGroup] = formQuestionsAnswers.results;
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
}

export function getConsolidatedMeasurableGroups(
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel,
) {
  return formQuestionsAnswers.results.filter((group) => !group.identifier);
}

export function buildConsolidatedParticipantGroupingForPdf(params: {
  formQuestionsAnswers: FormQuestionsAnswersBrowseModel;
  groupingMode: ConsolidatedAnalyticsGroupingMode;
  groupingLabel: string;
}): {
  grouping:
    | { active: false }
    | { active: true; questionId: string; questionLabel: string };
  participantGroups: ParticipantGroupForIndicators[];
} {
  const participantGroups = buildConsolidatedAnalyticsParticipantGroups({
    formQuestionsAnswers: params.formQuestionsAnswers,
    groupingMode: params.groupingMode,
  });

  if (params.groupingMode === 'overview') {
    return {
      grouping: { active: false },
      participantGroups,
    };
  }

  return {
    grouping: {
      active: true,
      questionId: params.groupingMode,
      questionLabel: params.groupingLabel,
    },
    participantGroups,
  };
}

export function buildConsolidatedAnalyticsRecorteSnapshot(params: {
  mode: 'charts' | 'indicators';
  filters: ConsolidatedAnalyticsFilters;
  participantGroups: ParticipantGroupForIndicators[];
  protectedGroupIds: string[];
  totals: {
    totalParticipants: number;
    totalResponded: number;
    totalNotResponded: number;
    completionPercent: number;
  };
}) {
  return {
    mode: params.mode,
    filters: params.filters,
    totals: params.totals,
    participantGroups: params.participantGroups.map((group) => ({
      id: group.id,
      name: group.name,
      participantCount: group.participantIds.size,
      isProtected: shouldProtectConsolidatedAnalyticsGroup(
        group.participantIds.size,
      ),
    })),
    protectedGroupIds: params.protectedGroupIds,
  };
}

export function getConsolidatedStructuralGroupingOptions() {
  return [
    {
      id: 'overview' as const,
      label: 'Visão geral consolidada',
    },
    {
      id: CONSOLIDATED_ANALYTICS_COMPANY_GROUPING_KEY,
      label: 'Empresa de origem',
    },
    ...STRUCTURAL_INDICATOR_GROUPING_CONFIGS.filter((config) =>
      (
        [
          '__participant_workspace',
          '__participant_sector',
          '__participant_directory',
          '__participant_management',
        ] as StructuralIndicatorGroupingKey[]
      ).includes(config.key),
    ).map((config) => ({
      id: config.key,
      label: config.selectLabel,
    })),
  ];
}
