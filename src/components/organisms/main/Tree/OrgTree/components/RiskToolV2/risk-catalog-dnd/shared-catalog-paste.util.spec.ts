import assert from 'node:assert/strict';
import { sameRiskCatalogMatch } from './shared-catalog-paste.util';
const destination = { risk: { id: 'gasoline' } };
for (const kind of ['rec', 'adm', 'eng'] as const) {
  const result = sameRiskCatalogMatch(
    {
      kind,
      sourceRiskId: 'benzene',
      name: 'Controle',
      catalogId: 'original-id',
      recType: 'ADM',
    },
    destination,
  );
  assert.equal(result?.status, 'attach_existing');
  if (result?.status === 'attach_existing')
    assert.equal(result.match.id, 'original-id');
}
assert.equal(
  sameRiskCatalogMatch(
    { kind: 'rec', sourceRiskId: 'benzene', name: 'Controle' },
    destination,
  ),
  null,
);
assert.equal(
  sameRiskCatalogMatch(
    { kind: 'epi', sourceRiskId: 'benzene', name: 'EPI', catalogId: 'epi' },
    destination,
  ),
  null,
);
assert.equal(
  sameRiskCatalogMatch(
    {
      kind: 'generateSource',
      sourceRiskId: 'benzene',
      name: 'Fonte',
      catalogId: 'source',
    },
    destination,
  ),
  null,
);
console.log('shared catalogue paste: preserves IDs across factors');

import { dedupeRiskCatalogDragItems } from './find-risk-catalog-item-match.util';
const sameText = { kind: 'rec' as const, sourceRiskId: 'risk', name: 'Treinar motoristas' };
assert.equal(dedupeRiskCatalogDragItems([{ ...sameText, recType: 'ADM' }, { ...sameText, recType: 'ENG' }]).length, 2);
assert.equal(dedupeRiskCatalogDragItems([{ ...sameText, recType: 'ADM' }, { ...sameText, name: ' TREINAR   MOTORISTAS ', recType: 'ADM' }]).length, 1);
