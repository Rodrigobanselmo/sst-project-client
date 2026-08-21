/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/utils/emptyParagraphPlaceholder.spec.ts
 */
import assert from 'assert';

import { isEmptyParagraphContent } from './emptyParagraphPlaceholder';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

run('treats null, undefined and empty string as empty', () => {
  assert.strictEqual(isEmptyParagraphContent(null), true);
  assert.strictEqual(isEmptyParagraphContent(undefined), true);
  assert.strictEqual(isEmptyParagraphContent(''), true);
});

run('treats whitespace, newlines and nbsp as empty', () => {
  assert.strictEqual(isEmptyParagraphContent('   '), true);
  assert.strictEqual(isEmptyParagraphContent('\n'), true);
  assert.strictEqual(isEmptyParagraphContent('\n\n'), true);
  assert.strictEqual(isEmptyParagraphContent('\u00a0'), true);
  assert.strictEqual(isEmptyParagraphContent(' \u00a0 \n '), true);
});

run('keeps real content as non-empty', () => {
  assert.strictEqual(isEmptyParagraphContent('texto'), false);
  assert.strictEqual(isEmptyParagraphContent(' Novo parágrafo '), false);
  assert.strictEqual(isEmptyParagraphContent('??NOME_DA_EMPRESA??'), false);
});

console.log('\nAll empty-paragraph placeholder tests passed.');
