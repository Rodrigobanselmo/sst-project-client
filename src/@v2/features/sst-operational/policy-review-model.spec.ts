import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  policyDraftKey,
  policyImpactMessage,
  policyPreviewMatches,
  policyReviewError,
  type PolicyDraft,
  type PolicyPreview,
} from './policy-review-model.ts';

const draft: PolicyDraft = {
  fromDate: '2026-01-01',
  reason: 'Incluir histórico importado',
  expectedRevision: 2,
};
const data: PolicyPreview = {
  previewHash: 'preview-1',
  expectedRevision: 2,
  fromDate: '2026-01-01',
  previousFromDate: '2026-04-01',
  direction: 'EXPAND',
  acceptedDeclarations: 1,
  acceptedEmployments: 1,
};
const preview = { draftKey: policyDraftKey(draft), data };

test('prévia de corte só confirma o formulário e a revisão que foram analisados', () => {
  assert.equal(policyPreviewMatches(preview, draft), true);
  assert.equal(policyPreviewMatches(undefined, draft), false);
  for (const changed of [
    { ...draft, fromDate: '2026-02-01' },
    { ...draft, reason: 'Outro motivo' },
    { ...draft, expectedRevision: 3 },
  ])
    assert.equal(policyPreviewMatches(preview, changed), false);
  assert.equal(
    policyPreviewMatches(
      { ...preview, data: { ...data, expectedRevision: 1 } },
      draft,
    ),
    false,
  );
  assert.equal(
    policyPreviewMatches(
      { ...preview, data: { ...data, fromDate: '2026-02-01' } },
      draft,
    ),
    false,
  );
});

test('identidade da tentativa normaliza espaços do motivo sem misturar datas ou revisões', () => {
  assert.equal(
    policyDraftKey({ ...draft, reason: ` ${draft.reason} ` }),
    policyDraftKey(draft),
  );
  assert.notEqual(
    policyDraftKey({ ...draft, expectedRevision: 3 }),
    policyDraftKey(draft),
  );
});

test('impacto não promete novos XMLs e exige seleção explícita para incluir histórico', () => {
  assert.match(
    policyImpactMessage('EXPAND'),
    /somente.*explicitamente.*histórico/,
  );
  assert.match(policyImpactMessage('REDUCE'), /correções.*aceitos.*continuam/);
  assert.match(policyImpactMessage('UNCHANGED'), /não cria outra revisão/);
  assert.match(policyImpactMessage('INITIAL'), /preparar as condições/);
});

test('conflitos preservam o rascunho e envio em voo exige aguardar', () => {
  assert.match(
    policyReviewError('POLICY_PREVIEW_STALE')!,
    /novamente.*mantidos/,
  );
  assert.match(
    policyReviewError('POLICY_REVISION_CONFLICT')!,
    /outra pessoa.*mantido/,
  );
  assert.match(
    policyReviewError('POLICY_REVIEW_REQUIRED')!,
    /impacto.*mantido/,
  );
  assert.match(
    policyReviewError('INITIAL_POLICY_IN_FLIGHT')!,
    /Retome ou cancele.*incertos.*reconciliados/,
  );
  assert.equal(policyReviewError('UNKNOWN'), undefined);
});
