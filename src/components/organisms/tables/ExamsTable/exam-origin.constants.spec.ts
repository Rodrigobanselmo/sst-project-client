/**
 * Contraste da tag Sistema — só apresentação, sem mudar enum.
 * npx tsx src/components/organisms/tables/ExamsTable/exam-origin.constants.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const src = readFileSync(
  resolve('src/components/organisms/tables/ExamsTable/exam-origin.constants.ts'),
  'utf8',
);

assert.match(src, /function getSystemChipPresentationSx/);
assert.match(src, /palette\.mode === 'dark'/);
assert.match(src, /palette\.grey\[700\]/);
assert.match(src, /palette\.common\.white/);
assert.match(src, /ExamOriginEnum\.SYSTEM:\s*\n\s*return getSystemChipPresentationSx\(base\)/);
assert.match(
  src,
  /ExamOriginSourceEnum\.SYSTEM:\s*\n\s*return getSystemChipPresentationSx\(base\)/,
);
assert.equal(src.includes("[ExamOriginEnum.SYSTEM]: 'Sistema'"), true);
assert.equal(src.includes("[ExamOriginEnum.NR07]: 'NR-07'"), true);

console.log('exam-origin.constants.spec.ts ok');
