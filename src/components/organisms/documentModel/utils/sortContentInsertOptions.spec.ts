/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/utils/sortContentInsertOptions.spec.ts
 */
import assert from 'assert';

import { sortContentInsertOptions } from './sortContentInsertOptions';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const catalog = [
  { type: 'BULLET', label: 'Marcador', order: 1 },
  { type: 'PARAGRAPH', label: 'Parágrafo', order: 1 },
  { type: 'H1', label: 'H1', order: 2 },
  { type: 'H2', label: 'H2', order: 2 },
  { type: 'TITLE', label: 'Texto', order: 2 },
  { type: 'BULLET_SPACE', label: 'Marcador (Espaçamento)', order: 3 },
];

run('puts Parágrafo before Marcador without moving the rest', () => {
  const sorted = sortContentInsertOptions(catalog).map((item) => item.type);

  assert.deepStrictEqual(sorted, [
    'PARAGRAPH',
    'BULLET',
    'H1',
    'H2',
    'TITLE',
    'BULLET_SPACE',
  ]);
});

run('keeps lower catalog order ahead of Parágrafo/Marcador', () => {
  const sorted = sortContentInsertOptions([
    { type: 'IMAGE', label: 'Imagem', order: 4 },
    { type: 'BULLET', label: 'Marcador', order: 1 },
    { type: 'PARAGRAPH', label: 'Parágrafo', order: 1 },
  ]).map((item) => item.type);

  assert.deepStrictEqual(sorted, ['PARAGRAPH', 'BULLET', 'IMAGE']);
});

console.log('\nAll content-insert sort tests passed.');
