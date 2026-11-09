import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormQuestionsAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';

import { buildCopsoqLongDimensionView } from './buildCopsoqLongDimensionView';
import {
  buildIndicatorsPdfDataset,
  buildIndicatorsPresentation,
} from './buildIndicatorsPdfDataset';
import structure from '@v2/models/form/copsoq-long-dimensions.json';

function createLongFixture() {
  return new FormQuestionsAnswersBrowseModel({
    results: [
      {
        id: 'identifier',
        name: 'Identificação',
        order: 0,
        identifier: true,
        questions: [],
      },
      ...structure.blocks.map((block, index) => ({
        id: block.groupId,
        name: `Bloco ${index + 1}`,
        order: index + 1,
        identifier: false,
        questions: block.dimensions
          .flatMap((dimension) => dimension.questionIds)
          .map((id, order) => ({
            id,
            order,
            required: true,
            details: { id, text: id, type: FormQuestionTypeEnum.RADIO },
            options: [{ id: 'choice', text: 'Opção', order: 0, value: 4 }],
            answers: Array.from({ length: 3 }, (_, n) => ({
              id: `${id}-${n}`,
              participantsAnswersId: `participant-${n}`,
              selectedOptionsIds: ['choice'],
            })),
          })),
      })),
    ],
  });
}

test('long form dimension view retains every original question and answer and feeds the indicator PDF', () => {
  const source = createLongFixture();
  const dimensions = buildCopsoqLongDimensionView(structure.formId, source);
  assert.ok(dimensions);
  assert.strictEqual(dimensions.results[0], source.results[0]);
  assert.equal(source.results.length, 9);
  assert.equal(dimensions.results.length, 45);

  const originalQuestions = new Map(
    source.results.flatMap((g) => g.questions.map((q) => [q.id, q])),
  );
  const displayedQuestions = dimensions.results.flatMap((g) => g.questions);
  assert.equal(originalQuestions.size, 146);
  assert.equal(displayedQuestions.length, 146);
  assert.equal(new Set(displayedQuestions.map((q) => q.id)).size, 146);
  for (const question of displayedQuestions) {
    assert.strictEqual(question, originalQuestions.get(question.id));
  }

  const options = {
    selectedGroupingQuestionId: null,
    showOnlyGroupIndicators: true,
    isShareableLink: true,
  };
  const byBlock = buildIndicatorsPdfDataset({
    ...options,
    formQuestionsAnswers: source,
  });
  const byDimension = buildIndicatorsPdfDataset({
    ...options,
    formQuestionsAnswers: dimensions,
  });
  assert.equal(byBlock.formGroups.length, 8);
  assert.equal(byDimension.formGroups.length, 44);
  assert.ok(
    byDimension.formGroups.some(
      (group) => group.groupName === 'Dimensão — Insegurança no Trabalho',
    ),
  );
});

test('partial answer payloads preserve available dimensions and reject unrelated questions', () => {
  const source = createLongFixture();
  assert.equal(buildCopsoqLongDimensionView('another-model', source), null);

  const missing = source.results[1].questions.pop();
  const view = buildCopsoqLongDimensionView(structure.formId, source);
  assert.ok(view);
  const visibleQuestions = view.results.flatMap((group) => group.questions);
  assert.equal(visibleQuestions.length, 145);
  assert.ok(!visibleQuestions.includes(missing!));

  source.results[1].questions.push({ ...missing!, id: 'unknown-question' });
  assert.equal(buildCopsoqLongDimensionView(structure.formId, source), null);
});

test('combined presentation places dimensions under scales and counts every question once', () => {
  const source = createLongFixture();
  const view = buildCopsoqLongDimensionView(structure.formId, source);
  assert.ok(view);
  const params = {
    formQuestionsAnswers: source,
    selectedGroupingQuestionId: null,
    showOnlyGroupIndicators: false,
    isShareableLink: true,
  };

  for (const [scales, dimensions, groups] of [
    [true, true, 52],
    [true, false, 8],
    [false, true, 44],
    [false, false, 0],
  ] as const) {
    const report = buildIndicatorsPresentation(params, view, {
      scales,
      dimensions,
    });
    assert.equal(
      report.formGroups.filter((group) => !group.hideGroup).length,
      groups,
    );
    assert.equal(
      report.formGroups.filter((group) => group.depth).length,
      scales && dimensions ? 44 : 0,
    );
    const questionIds = report.formGroups.flatMap((group) =>
      (group.questions ?? []).map((question) => question.questionId),
    );
    assert.equal(questionIds.length, 146);
    assert.equal(new Set(questionIds).size, 146);
  }
});

test('the dimension-based long form derives scales while retaining its original questions and dimensions', () => {
  const scales = createLongFixture();
  const fixture = buildCopsoqLongDimensionView(structure.formId, scales);
  assert.ok(fixture);
  const source = new FormQuestionsAnswersBrowseModel({
    ...fixture,
    results: fixture.results.map((group) => ({
      ...group,
      questions: group.questions.map((question) => ({
        ...question,
        id: `dimension-model-${question.id}`,
      })),
    })),
  });
  const view = buildCopsoqLongDimensionView(structure.dimensionFormId, source);
  assert.ok(view?.scaleResults);
  assert.strictEqual(view.results, source.results);

  const [firstScale, ...otherScales] = structure.blocks;
  const [firstDimension, ...otherDimensions] = firstScale.dimensions;
  const renamed = buildCopsoqLongDimensionView(
    structure.dimensionFormId,
    source,
    {
      mode: 'dimensions',
      blocks: [
        {
          ...firstScale,
          dimensions: [
            { ...firstDimension, name: 'Nome independente' },
            ...otherDimensions,
          ],
        },
        ...otherScales,
      ],
    },
  );
  const dimension = renamed?.results.find(({ id }) => id === firstDimension.id);
  assert.equal(dimension?.name, 'Dimensão — Nome independente');
  assert.strictEqual(
    dimension?.questions,
    source.results.find(({ id }) => id === firstDimension.id)?.questions,
  );

  assert.deepEqual(
    view.scaleResults.slice(1).map((group) => group.id),
    structure.blocks.map((block) => block.groupId),
  );

  const originalQuestions = new Map(
    source.results.flatMap((group) =>
      group.questions.map((question) => [question.id, question] as const),
    ),
  );
  const groupedQuestions = view.scaleResults.flatMap(
    (group) => group.questions,
  );
  assert.equal(groupedQuestions.length, 146);
  for (const question of groupedQuestions) {
    assert.strictEqual(question, originalQuestions.get(question.id));
  }

  for (const [scalesVisible, dimensionsVisible, expectedGroups] of [
    [true, true, 52],
    [true, false, 8],
    [false, true, 44],
    [false, false, 0],
  ] as const) {
    const report = buildIndicatorsPresentation(
      {
        formQuestionsAnswers: source,
        selectedGroupingQuestionId: null,
        showOnlyGroupIndicators: false,
        isShareableLink: true,
      },
      view,
      { scales: scalesVisible, dimensions: dimensionsVisible },
    );
    assert.equal(
      report.formGroups.filter((group) => !group.hideGroup).length,
      expectedGroups,
    );
    const questions = report.formGroups.flatMap(
      (group) => group.questions ?? [],
    );
    assert.equal(questions.length, 146);
    assert.deepEqual(
      new Set(questions.map((question) => question.questionId)),
      new Set(originalQuestions.keys()),
    );
  }
});
