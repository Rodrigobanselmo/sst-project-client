import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCampaignReportDataset,
  type ReportGroupInput,
} from './campaign-report.dataset.ts';

function group(values: number[], selected: string[][]): ReportGroupInput {
  return {
    id: 'g',
    name: 'Tema',
    identifier: false,
    questions: [
      {
        id: 'q',
        details: { text: 'Enunciado negativo: nunca', type: 'RADIO' },
        options: values.map((value, index) => ({
          id: String(index),
          text: 'Discordo',
          value,
        })),
        answers: selected.map((ids, index) => ({
          participantsAnswersId: `p${index}`,
          selectedOptionsIds: ids,
        })),
      },
    ],
  };
}

test('uses registered direction without inverting negative wording; excludes zero and absence', () => {
  const [result] = buildCampaignReportDataset([
    group([5, 1, 0], [['0'], ['0'], ['0'], ['1'], ['1'], ['1'], ['2'], []]),
  ]);
  assert.equal(result.score, 50);
  assert.equal(result.denominator, 6);
  assert.equal(result.questions[0].respondents, 7);
  assert.equal(result.questions[0].excludedSelections, 1);
  assert.equal(result.questions[0].distribution, null); // Small excluded cell cannot be derived.
});

test('hides the complete distribution when a small cell could be reconstructed', () => {
  const [result] = buildCampaignReportDataset([
    group([1, 5], [['0'], ['1'], ['1'], ['1']]),
  ]);
  assert.equal(result.questions[0].distribution, null);
  assert.equal(result.questions[0].score, 25);
});

test('protects small questions, omits identification and never retains raw responses', () => {
  const input = group([5], [['0'], ['0']]);
  const output = buildCampaignReportDataset([
    input,
    { ...input, id: 'identifier', identifier: true },
  ]);
  assert.equal(output.length, 1);
  assert.equal(output[0].score, null);
  assert.equal(output[0].questions[0].respondents, null);
  assert.equal(JSON.stringify(output).includes('participantsAnswersId'), false);
});

test('fails closed for invalid scores and unknown options rather than silently estimating', () => {
  for (const input of [
    group([6], [['0'], ['0'], ['0']]),
    group([5], [['missing'], ['missing'], ['missing']]),
  ]) {
    const [result] = buildCampaignReportDataset([input]);
    assert.equal(result.score, null);
    assert.equal(result.questions[0].invalidSelections, 3);
  }
});

test('counts multiple-choice per selection and uses distinct respondents for distributions', () => {
  const input = group(
    [1, 5],
    [
      ['0', '1'],
      ['0', '1'],
      ['0', '1'],
    ],
  );
  input.questions[0].details.type = 'CHECKBOX';
  const [result] = buildCampaignReportDataset([input]);
  assert.equal(result.score, 50);
  assert.equal(result.denominator, 6);
  assert.deepEqual(
    result.questions[0].distribution?.map((item) => item.percentage),
    [100, 100],
  );
});

test('keeps nonempty open-text coverage separate from semantic classification without returning text', () => {
  const input = group([], [[], [], [], []]);
  input.questions[0].details.type = 'LONG_TEXT';
  input.questions[0].answers.forEach(
    (answer, index) => (answer.value = index === 3 ? '  ' : 'Sensitive text'),
  );
  const [result] = buildCampaignReportDataset([input]);
  assert.equal(result.questions[0].textCount, 3);
  assert.equal(JSON.stringify(result).includes('Sensitive text'), false);
  assert.equal(result.score, null);
});

test('maps the editor classifications: very positive 1 to 100, very negative 5 to 0', () => {
  for (const [value, expected] of [
    [1, 100],
    [2, 75],
    [3, 50],
    [4, 25],
    [5, 0],
  ]) {
    const [result] = buildCampaignReportDataset([
      group([value], [['0'], ['0'], ['0']]),
    ]);
    assert.equal(result.score, expected);
  }
});
