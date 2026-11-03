import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  requireStructuralPeriods,
  structuralEmploymentCount,
  structuralIntent,
  structuralMetadataDraft,
  structuralMetadataPatch,
} from './structural-review-model.ts';

test('structural impact displays the exact SQL total rather than the bounded sample size', () => {
  assert.equal(structuralEmploymentCount({ affectedEmployments: 10000, affectedEmploymentIds: ['sample-a', 'sample-b'] }), 10000);
  assert.equal(structuralEmploymentCount({ affectedEmployments: 0, affectedEmploymentIds: ['obsolete-sample'] }), 0);
  assert.equal(structuralEmploymentCount({ affectedEmploymentIds: ['legacy-a', 'legacy-b'] }), 2);
});

test('lifecycle changes and historical corrections have distinct mandatory intents', () => {
  assert.equal(structuralIntent('ARCHIVE'), 'NEW_CONDITION');
  assert.equal(structuralIntent('RESTORE'), 'NEW_CONDITION');
  assert.equal(structuralIntent('METADATA'), 'CORRECTION');
  assert.equal(structuralIntent('RELATION_PERIODS'), 'CORRECTION');
});
test('metadata editing omits unchanged fields and normalizes the edited CNPJ only', () => {
  const values = {
    name: 'Unidade',
    description: 'Anterior',
    cnpj: '11222333000181',
  };
  const fields = Object.keys(values);
  const draft = {
    ...structuralMetadataDraft(values, fields),
    description: 'Corrigida',
    cnpj: '11.222.333/0001-81',
  };
  assert.deepEqual(structuralMetadataPatch(values, draft, fields), {
    description: 'Corrigida',
    cnpj: '11222333000181',
  });
  assert.equal(values.description, 'Anterior');
});
test('unchanged structured paragraphs preserve their original representation', () => {
  const values = {
    paragraphs: [
      'Descrição anterior{type}=PARAGRAPH',
      'Observação{type}=BULLET_0',
    ],
    name: 'Origem',
  };
  const draft = structuralMetadataDraft(values, ['paragraphs', 'name']);
  assert.equal(draft.paragraphs, 'Descrição anterior\nObservação');
  assert.deepEqual(
    structuralMetadataPatch(values, { ...draft, name: 'Nome corrigido' }, [
      'paragraphs',
      'name',
    ]),
    { name: 'Nome corrigido' },
  );
});
test('edited paragraph text retains the existing paragraph formatting', () => {
  const values = { activities: ['Atividade anterior{type}=BULLET_0'] };
  const draft = {
    ...structuralMetadataDraft(values, ['activities']),
    activities: 'Atividade corrigida',
  };
  assert.deepEqual(structuralMetadataPatch(values, draft, ['activities']), {
    activities: ['Atividade corrigida{type}=BULLET_0'],
  });
});
test('boolean metadata requires an explicit answer and preserves false', () => {
  assert.deepEqual(
    structuralMetadataPatch({ isOwner: true }, { isOwner: 'false' }, [
      'isOwner',
    ]),
    { isOwner: false },
  );
  assert.throws(
    () =>
      structuralMetadataPatch({ isOwner: true }, { isOwner: '' }, ['isOwner']),
    /Escolha/,
  );
  assert.throws(
    () =>
      structuralMetadataPatch({ name: 'Origem' }, { name: 'Origem' }, ['name']),
    /pelo menos um campo/,
  );
});
test('relation correction preserves the current open participation', () => {
  assert.deepEqual(
    requireStructuralPeriods([{ effectiveFrom: '2026-04-01' }], true),
    [{ effectiveFrom: '2026-04-01' }],
  );
  assert.throws(
    () =>
      requireStructuralPeriods(
        [{ effectiveFrom: '2026-04-01', effectiveTo: '2026-05-01' }],
        true,
      ),
    /participação atual/,
  );
  assert.throws(
    () => requireStructuralPeriods([{ effectiveFrom: '2026-04-01' }], false),
    /participação atual/,
  );
});
test('overlapping and impossible periods cannot be previewed as valid', () => {
  assert.throws(
    () => requireStructuralPeriods([{ effectiveFrom: '2026-02-29' }], true),
    /datas/,
  );
  assert.throws(
    () =>
      requireStructuralPeriods(
        [
          { effectiveFrom: '2026-01-01', effectiveTo: '2026-04-02' },
          { effectiveFrom: '2026-04-01' },
        ],
        true,
      ),
    /sobrepor/,
  );
  assert.throws(
    () =>
      requireStructuralPeriods(
        [{ effectiveFrom: '2026-04-01', effectiveTo: '2026-04-01' }],
        false,
      ),
    /datas/,
  );
});
test('adjacent historical periods remain separate and sorted', () => {
  assert.deepEqual(
    requireStructuralPeriods(
      [
        { effectiveFrom: '2026-04-01' },
        { effectiveFrom: '2026-01-01', effectiveTo: '2026-04-01' },
      ],
      true,
    ),
    [
      { effectiveFrom: '2026-01-01', effectiveTo: '2026-04-01' },
      { effectiveFrom: '2026-04-01' },
    ],
  );
});
