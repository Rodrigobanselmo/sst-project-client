/**
 * Contrato — limpeza de vínculos cargo↔elemento (Fases 2–5).
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-link-cleanup.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildBulkUnlinkConfirmMessage,
  buildDeleteManyWithCleanupMessage,
  buildDeleteWithCleanupMessage,
  CHARACTERIZATION_LINK_CLEANUP_TEXTS,
  countActiveHierarchyHomoRows,
  countActiveLinksFromBrowseRows,
  shouldShowQuickUnlink,
} from './characterization-link-cleanup.util';

assert.equal(shouldShowQuickUnlink(0), false);
assert.equal(shouldShowQuickUnlink(1), true);
assert.equal(shouldShowQuickUnlink(2), false);

assert.equal(
  CHARACTERIZATION_LINK_CLEANUP_TEXTS.quickUnlink.title,
  'Remover vínculo do cargo?',
);
assert.ok(
  CHARACTERIZATION_LINK_CLEANUP_TEXTS.quickUnlink.body.includes(
    'somente o vínculo',
  ),
);
assert.equal(
  CHARACTERIZATION_LINK_CLEANUP_TEXTS.quickUnlink.confirm,
  'Remover vínculo',
);

const bulkMsg = buildBulkUnlinkConfirmMessage({
  linksCount: 12,
  elementsWithLinks: 5,
});
assert.ok(bulkMsg.includes('12 vínculos ativos'));
assert.ok(bulkMsg.includes('5 elementos'));
assert.ok(bulkMsg.includes('cargos continuarão cadastrados'));
assert.ok(bulkMsg.includes('PCMSO'));

const deleteMsg = buildDeleteWithCleanupMessage({
  name: 'Posto Lapa',
  activeLinks: 3,
});
assert.ok(deleteMsg.includes("'Posto Lapa'"));
assert.ok(deleteMsg.includes('3 vínculo(s)'));
assert.ok(deleteMsg.includes('PGR'));

assert.equal(
  buildDeleteManyWithCleanupMessage({ elements: 2, activeLinks: 0 }),
  'Deseja excluir as caracterizações selecionadas?',
);
assert.ok(
  buildDeleteManyWithCleanupMessage({ elements: 2, activeLinks: 4 }).includes(
    '4 vínculo(s)',
  ),
);

assert.deepEqual(
  countActiveLinksFromBrowseRows([
    { hierarchies: [{ id: 'a' }] },
    { hierarchies: [{ id: 'b' }, { id: 'c' }] },
    { hierarchies: [] },
  ]),
  { elements: 3, elementsWithLinks: 2, activeLinks: 3 },
);

assert.equal(
  countActiveHierarchyHomoRows([
    { endDate: null },
    { endDate: new Date() },
    {},
  ]),
  2,
);

assert.equal(
  CHARACTERIZATION_LINK_CLEANUP_TEXTS.deleteWithCleanup.confirm,
  'Remover vínculos e excluir',
);

console.log('characterization-link-cleanup.spec.ts: OK');
