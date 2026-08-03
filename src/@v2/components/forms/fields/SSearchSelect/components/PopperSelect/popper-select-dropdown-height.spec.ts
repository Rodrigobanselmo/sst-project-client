/**
 * Regressão visual — dropdown do SSearchSelect (Atualizar etapa / Atualizar Status).
 *
 * Executar:
 * npx tsx src/@v2/components/forms/fields/SSearchSelect/components/PopperSelect/popper-select-dropdown-height.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const popperSelectPath = join(
  __dirname,
  'components/PopperSelectComponent.tsx',
);
const selectItemPath = join(
  __dirname,
  '../../../../../organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem.tsx',
);

const popperSource = readFileSync(popperSelectPath, 'utf8');
const itemSource = readFileSync(selectItemPath, 'utf8');

assert.doesNotMatch(
  popperSource,
  /position:\s*['"]fixed['"]/,
  'busca do dropdown não deve usar position:fixed (descola do fundo)',
);

assert.match(
  popperSource,
  /position:\s*['"]sticky['"]/,
  'busca do dropdown deve usar position:sticky no topo do contêiner',
);

assert.doesNotMatch(
  popperSource,
  /height=\{44\}/,
  'spacer artificial da busca fixed deve ter sido removido',
);

assert.match(
  popperSource,
  /height:\s*['"]auto['"]/,
  'paper/contêiner deve crescer com o conteúdo',
);

assert.doesNotMatch(
  itemSource,
  /position:\s*['"]sticky['"]/,
  'itens do menu não devem ser sticky (vazam do fundo branco)',
);

assert.match(
  itemSource,
  /position:\s*['"]relative['"]/,
  'itens do menu devem permanecer no fluxo do contêiner',
);

console.log('popper-select-dropdown-height.spec.ts: OK');
