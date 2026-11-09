import type { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

import {
  resolveFormIndicatorHierarchy,
  type FormIndicatorHierarchy,
} from '@v2/models/form/form-indicator-hierarchy';

/**
 * Preserves the question IDs of the applied long model. The dimension labels and
 * membership come from matching the two system models in the 2026-11-05 snapshot.
 */
export type CopsoqLongDimensionView = FormQuestionsAnswersBrowseModel & {
  parentGroupIds: Record<string, string>;
  scaleResults?: FormQuestionsAnswersBrowseModel['results'];
};

export type IndicatorLevels = { scales: boolean; dimensions: boolean };

export function buildCopsoqLongDimensionView(
  formId: string,
  data: FormQuestionsAnswersBrowseModel | null | undefined,
  savedHierarchy?: FormIndicatorHierarchy,
): CopsoqLongDimensionView | null {
  const structure = resolveFormIndicatorHierarchy(formId, savedHierarchy);
  if (!data || !structure) return null;
  if (structure.mode === 'dimensions')
    return buildScalesFromDimensions(data, structure.blocks, !!savedHierarchy);

  if (
    structure.blocks.some((block) =>
      block.dimensions.some(({ sectionId }) => !!sectionId),
    )
  ) {
    const groups = data.results.filter((group) => !group.identifier);
    const remaining = new Map(
      groups.flatMap(({ questions }) =>
        questions.map((question) => [question.id, question] as const),
      ),
    );
    const dimensions = structure.blocks.flatMap((block) =>
      block.dimensions.flatMap(({ id, name, questionIds }) => {
        const questions = (questionIds ?? []).flatMap((questionId) => {
          const question = remaining.get(questionId);
          remaining.delete(questionId);
          return question ? [question] : [];
        });
        return questions.length
          ? [{ id, name, questions, identifier: false, order: 0 }]
          : [];
      }),
    );
    if (remaining.size || !dimensions.length) return null;
    return buildScalesFromDimensions(
      {
        ...data,
        results: [
          ...data.results.filter((group) => group.identifier),
          ...dimensions,
        ],
      },
      structure.blocks,
      true,
    );
  }

  const groups = data.results.filter((group) => !group.identifier);
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  if (!groups.length || groupsById.size !== groups.length) return null;

  const knownBlockIds = new Set(structure.blocks.map((block) => block.groupId));
  if (groups.some((group) => !knownBlockIds.has(group.id))) return null;

  const results = data.results.filter((group) => group.identifier);
  const parentGroupIds: Record<string, string> = {};
  for (const block of structure.blocks) {
    const group = groupsById.get(block.groupId);
    if (!group) continue;

    const remaining = new Map(
      group.questions.map((question) => [question.id, question]),
    );
    if (remaining.size !== group.questions.length) return null;

    for (const dimension of block.dimensions) {
      const questions: typeof group.questions = [];
      for (const questionId of dimension.questionIds ?? []) {
        const question = remaining.get(questionId);
        if (!question) continue;
        questions.push(question);
        remaining.delete(questionId);
      }

      if (!questions.length) continue;

      parentGroupIds[dimension.id] = group.id;
      results.push({
        id: dimension.id,
        name: `Dimensão — ${dimension.name.replace(/^Dimensão — /, '')}`,
        identifier: false,
        order: results.length,
        questions: questions.sort((a, b) => a.order - b.order),
      });
    }

    if (remaining.size > 0) return null;
  }

  return { ...data, results, parentGroupIds };
}

function buildScalesFromDimensions(
  data: FormQuestionsAnswersBrowseModel,
  blocks: FormIndicatorHierarchy['blocks'],
  useDimensionNames: boolean,
): CopsoqLongDimensionView | null {
  const dimensions = data.results.filter((group) => !group.identifier);
  const byId = new Map(dimensions.map((group) => [group.id, group]));
  if (!dimensions.length || byId.size !== dimensions.length) return null;

  const scaleResults = data.results.filter((group) => group.identifier);
  const parentGroupIds: Record<string, string> = {};
  for (const block of blocks) {
    const questions = block.dimensions.flatMap(({ id }) => {
      const dimension = byId.get(id);
      if (!dimension) return [];
      parentGroupIds[id] = block.groupId;
      byId.delete(id);
      return dimension.questions;
    });
    if (!questions.length) continue;

    scaleResults.push({
      id: block.groupId,
      name: block.name,
      identifier: false,
      order: scaleResults.length,
      questions,
    });
  }
  if (byId.size || scaleResults.every((group) => group.identifier)) return null;

  const namesById = new Map(
    blocks.flatMap((block) =>
      block.dimensions.map(({ id, name }) => [id, name] as const),
    ),
  );
  const results = useDimensionNames
    ? data.results.map((group) => {
        const name = namesById.get(group.id);
        return !group.identifier && name
          ? { ...group, name: `Dimensão — ${name.replace(/^Dimensão — /, '')}` }
          : group;
      })
    : data.results;

  return { ...data, results, parentGroupIds, scaleResults };
}
