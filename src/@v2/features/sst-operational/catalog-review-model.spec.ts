import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  catalogAssessmentIssue,
  catalogSelectionIssue,
  catalogValueLabel,
  catalogFieldLabel,
  type CatalogAssessment,
  type CatalogPreview,
} from './catalog-review-model.ts';

const january: CatalogAssessment = {
  id: 'january',
  riskName: 'Ruído',
  sourceName: 'GSE Operação',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-04-01T00:00:00.000Z',
  workerCount: 2,
  protectedWorkerCount: 1,
  hasDeliveryInProgress: false,
};
const april: CatalogAssessment = {
  ...january,
  id: 'april',
  startDate: '2026-04-01T00:00:00.000Z',
  endDate: null,
};
const preview: CatalogPreview = {
  contractVersion: 1,
  expectedHead: 'head',
  impactHash: 'impact',
  target: { table: 'RiskFactors', id: 'noise' },
  catalogName: 'Ruído',
  mode: 'CATALOG_AND_USES',
  changes: [{ field: 'method', before: 'Anterior', after: 'Atual' }],
  assessments: [january, april],
  summary: { totalAssessments: 2, totalWorkers: 2 },
  limits: { selection: 200 },
};

test('catálogo: correção aceita início e exclui fim do período, sem converter o período encerrado em atual', () => {
  assert.equal(
    catalogAssessmentIssue(january, 'CORRECTION', '2026-01-01'),
    undefined,
  );
  assert.match(
    catalogAssessmentIssue(january, 'CORRECTION', '2025-12-31')!,
    /dentro/,
  );
  assert.match(
    catalogAssessmentIssue(january, 'CORRECTION', '2026-04-01')!,
    /anterior ao fim/,
  );
  assert.equal(
    catalogSelectionIssue(preview, ['january'], 'CORRECTION', '2026-02-01'),
    undefined,
  );
  assert.match(
    catalogSelectionIssue(
      preview,
      ['january', 'april'],
      'CORRECTION',
      '2026-02-01',
    )!,
    /dentro/,
  );
});

test('catálogo: nova condição precisa caber estritamente no período escolhido', () => {
  assert.match(
    catalogAssessmentIssue(january, 'NEW_CONDITION', '2026-01-01')!,
    /depois do início/,
  );
  assert.equal(
    catalogAssessmentIssue(january, 'NEW_CONDITION', '2026-03-31'),
    undefined,
  );
  assert.match(
    catalogAssessmentIssue(january, 'NEW_CONDITION', '2026-04-01')!,
    /anterior ao fim/,
  );
  assert.equal(
    catalogAssessmentIssue(april, 'NEW_CONDITION', '2026-05-01'),
    undefined,
  );
});

test('catálogo: envio pendente ou data inicial ausente impedem selecionar o uso', () => {
  assert.match(
    catalogAssessmentIssue({ ...april, hasDeliveryInProgress: true }, '', '')!,
    /envio em processamento/,
  );
  assert.match(
    catalogAssessmentIssue({ ...april, startDate: '' }, '', '')!,
    /data inicial/,
  );
});

test('catálogo: seleção exige usos conhecidos e respeita limite retornado pela API', () => {
  assert.match(catalogSelectionIssue(preview, [], '', '')!, /pelo menos uma/);
  assert.match(
    catalogSelectionIssue(preview, ['unknown'], '', '')!,
    /seleção mudou/,
  );
  assert.match(
    catalogSelectionIssue(
      { ...preview, limits: { selection: 1 } },
      ['january', 'april'],
      '',
      '',
    )!,
    /até 1/,
  );
  assert.equal(
    catalogSelectionIssue(preview, ['april'], 'NEW_CONDITION', '2026-05-01'),
    undefined,
  );
});

test('catálogo: diferenças mostram ausência, zero e não sem confundir os valores', () => {
  assert.equal(catalogValueLabel(null), 'Não informado');
  assert.equal(catalogValueLabel(''), 'Não informado');
  assert.equal(catalogValueLabel(0), '0');
  assert.equal(catalogValueLabel(false), 'Não');
  assert.equal(catalogValueLabel(true), 'Sim');
  assert.equal(catalogValueLabel([]), 'Não informado');
  assert.equal(
    catalogValueLabel(['Inalação', 'Contato com a pele']),
    'Inalação; Contato com a pele',
  );
  assert.equal(
    catalogValueLabel(['ADM', 'ENG'], 'recType'),
    'Administrativa; Engenharia / proteção coletiva',
  );
  assert.equal(catalogValueLabel('FIS', 'type'), 'Físico');
  assert.equal(
    catalogValueLabel('FIS', 'name'),
    'FIS',
    'free text must not be interpreted as a field enum',
  );
  assert.equal(
    catalogValueLabel('2027-04-01T00:00:00.000Z', 'expiredDate'),
    '01/04/2027',
  );
  assert.equal(
    catalogValueLabel({ description: 'Operar', subActivity: 'Turno A' }),
    'Descrição: Operar; Detalhe da atividade: Turno A',
  );
  assert.equal(catalogFieldLabel('breather'), 'Proteção respiratória');
  assert.equal(catalogFieldLabel('coments'), 'Observações');
  assert.equal(
    catalogFieldLabel('futureInternalField'),
    'Informação do cadastro',
  );
});

test('catálogo: matriz própria exibe a orientação técnica e impede selecionar a revisão de severidade', () => {
  const reviewIssue =
    'A mudança de severidade exige reavaliação técnica na origem.';
  const custom = { ...april, id: 'custom', reviewIssue };
  assert.equal(catalogAssessmentIssue(custom, '', ''), reviewIssue);
  assert.equal(
    catalogAssessmentIssue(custom, 'NEW_CONDITION', '2026-05-01'),
    reviewIssue,
  );
  assert.equal(
    catalogSelectionIssue(
      { ...preview, assessments: [custom] },
      ['custom'],
      'CORRECTION',
      '2026-04-01',
    ),
    reviewIssue,
  );
});

test('catálogo: uma avaliação com reavaliação técnica pendente não bloqueia outras avaliações selecionadas', () => {
  const custom = {
    ...april,
    id: 'custom',
    reviewIssue: 'Reavalie a severidade na matriz própria.',
  };
  const withCustom = {
    ...preview,
    assessments: [...preview.assessments, custom],
  };
  assert.equal(
    catalogSelectionIssue(withCustom, ['april'], 'NEW_CONDITION', '2026-05-01'),
    undefined,
  );
  assert.equal(
    catalogSelectionIssue(withCustom, ['april'], 'CORRECTION', '2026-04-01'),
    undefined,
  );
});
