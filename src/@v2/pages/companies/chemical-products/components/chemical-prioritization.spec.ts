import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveMatrixRiskLevel } from 'core/utils/helpers/matriz';
import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  analyzeChemicalScenario,
  areChemicalAssessmentsComplete,
  buildChemicalExclusionReport,
  confirmedChemicalScenarioRatings,
  emptyDecision,
  formatChemicalExclusionChapter,
  groupChemicalScenarios,
  suggestChemicalScenarioContact,
  summarizeChemicalAssessments,
} from './chemical-prioritization.ts';

import {
  formatChemicalScenarioQuantity,
  parseChemicalScenarioQuantity,
} from './chemical-use-scenario-quantity.util';

const factor = {
  id: 'factor',
  name: 'Agente de teste',
  cas: null,
  type: 'QUI',
  companyId: 'company',
  system: false,
};
const gse = { id: 'gse', name: 'GSE teste', deletedAt: null };
const scenario = {
  id: 'scenario',
  homogeneousGroup: gse,
  homogeneousGroupId: gse.id,
  surveyStatus: 'LEVANTAMENTO_CONCLUIDO',
  activityRiskFactors: [factor, factor],
  product: { tradeName: 'Produto de teste', activeComposition: null },
  activityName: 'Atividade',
  sourceRows: [2],
  durationMinutes: 0,
  controlMeasures: 'Controle informado',
} as ChemicalUseScenarioBoardRow;

test('agrupa por IDs do fator e do GSE, preservando cenários distintos', () => {
  const otherGroup = { ...gse, id: 'another-group' };
  const { groups, pending } = groupChemicalScenarios([
    scenario,
    { ...scenario, id: 'second' },
    {
      ...scenario,
      id: 'third',
      homogeneousGroupId: otherGroup.id,
      homogeneousGroup: otherGroup,
    },
  ]);
  assert.deepEqual(
    Object.fromEntries(
      groups.map((group) => [group.gse.id, group.scenarios.length]),
    ),
    { [gse.id]: 2, [otherGroup.id]: 1 },
  );
  assert.equal(pending.length, 0);
});

test('cenário incompleto do mesmo grupo impede sua inclusão no relatório', () => {
  const { groups, pending } = groupChemicalScenarios([
    scenario,
    { ...scenario, id: 'draft', surveyStatus: 'RASCUNHO' },
    { ...scenario, id: 'unlinked', homogeneousGroupId: null },
  ]);
  assert.equal(groups[0].scenarios.length, 2);
  assert.deepEqual(
    pending.map(({ scenario }) => scenario.id),
    ['draft', 'unlinked'],
  );
  assert.deepEqual(
    buildChemicalExclusionReport(groups, {
      [groups[0].key]: {
        inventory: 'exclude',
        justification: 'Motivo',
        reference: '',
      },
    }),
    [],
  );
});

test('exporta apenas decisões de não inclusão justificadas, com evidência e referência', () => {
  const { groups } = groupChemicalScenarios([scenario]);
  const key = groups[0].key;
  assert.deepEqual(
    buildChemicalExclusionReport(groups, { [key]: emptyDecision }),
    [],
  );
  const decision = {
    inventory: 'exclude',
    justification: '  ',
    reference: 'Referência técnica',
  } as const;
  assert.deepEqual(
    buildChemicalExclusionReport(groups, { [key]: decision }),
    [],
  );
  const report = buildChemicalExclusionReport(groups, {
    [key]: { ...decision, justification: '  Motivo documentado  ' },
  });
  assert.equal(report[0].justification, 'Motivo documentado');
  assert.match(report[0].scenarios[0], /Duração: 0 min/);
  assert.match(report[0].scenarios[0], /Controle informado/);
  assert.match(formatChemicalExclusionChapter(report), /Referência técnica/);
});

const catalog = (severity: number, limits = {}) => ({
  ...factor,
  prioritization: {
    severity,
    method: null,
    nr15lt: null,
    twa: null,
    stel: null,
    acgihCeiling: null,
    nioshRel: null,
    nioshStel: null,
    nioshCeiling: null,
    oshaPel: null,
    oshaStel: null,
    oshaCeiling: null,
    aihaWeel: null,
    aihaWeelStel: null,
    aihaWeelCeiling: null,
    ...limits,
  },
});
const complete = {
  ...scenario,
  frequencyCount: 1,
  frequencyPeriod: 'Diário',
  durationMinutes: 10,
  quantity: '0,00333',
  quantityUnit: 'L',
};

test('teto cadastrado e severidade 5 têm precedência, sem exigir notas', () => {
  const matrix = () => assert.fail('Sem probabilidade para a matriz');
  const result = analyzeChemicalScenario(
    catalog(2, { nr15lt: '0,5 ppm (C)' }),
    scenario,
    {},
    matrix,
  );
  assert.equal(result.outcome, 'include');
  assert.equal(result.references?.lowLimit?.source, 'NR-15');
  assert.doesNotMatch(result.reason, /Severidade 5/);
  const both = analyzeChemicalScenario(
    catalog(5, { acgihCeiling: '2' }),
    scenario,
    {},
    matrix,
  );
  assert.equal(both.outcome, 'include');
  assert.match(both.reason, /ACGIH teto: 2/);
  assert.match(both.reason, /Severidade 5, independentemente da probabilidade/);
  assert.equal(
    analyzeChemicalScenario(catalog(5), scenario, {}, matrix).outcome,
    'include',
  );
  assert.equal(
    analyzeChemicalScenario(
      catalog(2, { acgihCeiling: 'Sem limite (referência 5)' }),
      scenario,
      {},
      matrix,
    ).outcome,
    'exclude',
  );
});

test('severidades 3 e 4 usam as notas do cenário e somente resultado alto entra', () => {
  const matrix = (severity: number, probability: number) => {
    assert.equal(severity, 4);
    return probability === 4 ? 4 : 3;
  };
  const moderate = analyzeChemicalScenario(
    catalog(4, { twa: '0.5 ppm' }),
    complete,
    { contact: 2 },
    matrix,
  );
  const high = analyzeChemicalScenario(
    catalog(4),
    { ...complete, quantity: '230' },
    { contact: 2 },
    matrix,
  );
  assert.equal(moderate.frequencyScore, 3);
  assert.equal(moderate.durationScore, 2);
  assert.equal(moderate.probability, 3);
  assert.equal(moderate.outcome, 'exclude');
  assert.equal(moderate.references?.lowLimit?.source, 'ACGIH TWA');
  assert.equal(high.outcome, 'include');
  assert.equal(summarizeChemicalAssessments([moderate, high]), 'include');
  assert.equal(areChemicalAssessmentsComplete([moderate, high]), true);

  const awaitingContact = analyzeChemicalScenario(
    catalog(4),
    complete,
    {},
    matrix,
  );
  assert.equal(
    summarizeChemicalAssessments([high, awaitingContact]),
    'include',
  );
  assert.equal(areChemicalAssessmentsComplete([high, awaitingContact]), false);
});

test('dados ausentes ou inválidos permanecem pendentes, sem inventar notas', () => {
  const matrix = () => assert.fail('Não avalia cenário incompleto na matriz');
  const incomplete = analyzeChemicalScenario(
    catalog(3),
    { ...complete, quantity: '0' },
    { contact: 1 },
    matrix,
  );
  const low = analyzeChemicalScenario(catalog(1), scenario, {}, matrix);
  assert.equal(incomplete.outcome, 'pending');
  assert.equal(incomplete.quantityScore, null);
  assert.equal(summarizeChemicalAssessments([incomplete, low]), 'pending');
  assert.equal(
    analyzeChemicalScenario(factor, scenario, {}, matrix).outcome,
    'pending',
  );
});

test('usa faixas fixas de quantidade em litros e quilos, com limites inclusivos', () => {
  const score = (quantity: string, quantityUnit: string) =>
    analyzeChemicalScenario(
      catalog(2),
      { ...complete, quantity, quantityUnit },
      {},
      resolveMatrixRiskLevel,
    ).quantityScore;
  const quantities = [
    '1',
    '1.01',
    '10',
    '10.01',
    '100',
    '100.01',
    '500',
    '500.01',
  ];
  for (const unit of ['litros', 'Kg']) {
    assert.deepEqual(
      quantities.map((quantity) => score(quantity, unit)),
      [1, 2, 2, 3, 3, 4, 4, 5],
    );
  }
  assert.equal(score('500000', 'mL'), 4);
  assert.equal(score('500001', 'mL'), 5);
  assert.equal(score('500', 'unidades'), null);
  assert.equal(score('até 20 litros', 'L'), null);
});

test('sugere contato para manuseio explícito e deixa descrições incertas sem nota', () => {
  const suggest = (peakContactMoment: string) =>
    suggestChemicalScenarioContact({ ...complete, peakContactMoment });
  assert.equal(suggest('Troca de IBCs')?.score, 4);
  assert.equal(suggest('Verificação da aplicação'), undefined);
  assert.equal(suggest('Sem contato direto'), undefined);
});

test('antecipa a prioridade somente se nenhuma nota de contato mudar a decisão', () => {
  const receipt = {
    ...complete,
    frequencyPeriod: 'Mensal',
    durationMinutes: 120,
    quantity: '20,000',
  };
  const assess = (
    row: ChemicalUseScenarioBoardRow,
    review?: Parameters<typeof confirmedChemicalScenarioRatings>[0],
  ) =>
    analyzeChemicalScenario(
      catalog(3),
      row,
      confirmedChemicalScenarioRatings(review),
      resolveMatrixRiskLevel,
    );

  const unconfirmed = assess(receipt, {
    ratings: { contact: 1 },
    confirmed: false,
  });
  assert.equal(unconfirmed.quantityScore, 5);
  assert.equal(unconfirmed.priorityWithoutContact, true);
  assert.equal(unconfirmed.probability, null);
  assert.equal(unconfirmed.outcome, 'pending');
  assert.equal(summarizeChemicalAssessments([unconfirmed]), 'pending');

  for (const contact of [1, 2, 3, 4, 5] as const) {
    const confirmed = assess(receipt, {
      ratings: { contact },
      confirmed: true,
    });
    assert.equal(confirmed.outcome, 'include');
    assert.equal(confirmed.probability, 5);
    assert.equal(confirmed.priorityWithoutContact, false);
  }

  const lowerQuantity = { ...receipt, quantity: '230' };
  assert.equal(assess(lowerQuantity).priorityWithoutContact, false);
  assert.equal(
    assess(lowerQuantity, { ratings: { contact: 1 }, confirmed: true }).outcome,
    'exclude',
  );
  assert.equal(
    assess(lowerQuantity, { ratings: { contact: 5 }, confirmed: true }).outcome,
    'include',
  );
  assert.equal(
    assess({ ...receipt, durationMinutes: 0 }).priorityWithoutContact,
    false,
  );
});

test('ordena os grupos primeiro por GSE e depois por fator de risco', () => {
  const otherGroup = { ...gse, id: 'a', name: 'Administração' };
  const otherFactor = { ...factor, id: 'other', name: 'Zinco' };
  const { groups } = groupChemicalScenarios([
    scenario,
    {
      ...scenario,
      id: 'second',
      homogeneousGroup: otherGroup,
      homogeneousGroupId: otherGroup.id,
      activityRiskFactors: [otherFactor, factor],
    },
  ]);
  assert.deepEqual(
    groups.map(({ gse, factor }) => [gse.id, factor.id]),
    [
      ['a', 'factor'],
      ['a', 'other'],
      ['gse', 'factor'],
    ],
  );
});

test('classifica 20,000 litros como vinte mil, sem arredondar quantidades pequenas', () => {
  const receipt = { ...complete, id: 'receipt', quantity: '20,000' };
  const smallQuantity = { ...complete, id: 'small', quantity: '0.000003' };
  assert.equal(parseChemicalScenarioQuantity(receipt.quantity), 20000);
  assert.equal(formatChemicalScenarioQuantity(receipt.quantity), '20.000');
  assert.equal(formatChemicalScenarioQuantity('4,950'), '4.950');
  assert.equal(parseChemicalScenarioQuantity(smallQuantity.quantity), 0.000003);
  assert.equal(
    formatChemicalScenarioQuantity(smallQuantity.quantity),
    '0,000003',
  );
  assert.equal(parseChemicalScenarioQuantity('0,005'), 0.005);
  assert.equal(parseChemicalScenarioQuantity('1.250'), 1.25);
  assert.equal(parseChemicalScenarioQuantity('20,000.25'), 20000.25);
  assert.equal(parseChemicalScenarioQuantity('20.000,25'), 20000.25);
  assert.equal(parseChemicalScenarioQuantity('1,2,3'), null);
  assert.equal(
    analyzeChemicalScenario(
      catalog(3),
      smallQuantity,
      {},
      resolveMatrixRiskLevel,
    ).quantityScore,
    1,
  );
});
