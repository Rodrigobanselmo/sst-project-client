/**
 * npx tsx src/components/organisms/tables/GhosTable/classify-risk-group-inventory.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  classifyRiskGroupInventory,
  emptySstInventoryMessage,
} from './classify-risk-group-inventory.util';

assert.deepEqual(classifyRiskGroupInventory([]), { kind: 'none' });
assert.deepEqual(classifyRiskGroupInventory(undefined), { kind: 'none' });
assert.deepEqual(classifyRiskGroupInventory(null), { kind: 'none' });

assert.deepEqual(classifyRiskGroupInventory([{ id: 'only' }]), {
  kind: 'unique',
  id: 'only',
});

const many = classifyRiskGroupInventory([
  { id: 'first' },
  { id: 'second' },
  { id: 'last' },
]);
assert.equal(many.kind, 'multiple');
if (many.kind === 'multiple') {
  assert.equal(many.groups.length, 3);
  assert.equal(
    'id' in many && (many as { id?: string }).id,
    false,
    'múltiplos grupos não selecionam um id automaticamente',
  );
}

assert.equal(
  emptySstInventoryMessage('origem').includes('Sistema de Gestão SST'),
  true,
);
assert.equal(emptySstInventoryMessage('origem').includes('na origem'), true);
assert.equal(emptySstInventoryMessage('destino').includes('no destino'), true);

console.log('classify-risk-group-inventory.util.spec.ts ok');
