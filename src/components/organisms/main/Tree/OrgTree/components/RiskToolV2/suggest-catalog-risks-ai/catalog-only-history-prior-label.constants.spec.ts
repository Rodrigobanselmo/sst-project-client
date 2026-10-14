import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CATALOG_ONLY_HISTORY_PRIOR_LABEL } from './catalog-only-history-prior-label.constants';

assert.equal(
  CATALOG_ONLY_HISTORY_PRIOR_LABEL,
  'Identificado pela IA em consulta anterior',
);
assert.equal(CATALOG_ONLY_HISTORY_PRIOR_LABEL.includes('Validado'), false);

const panel = readFileSync(
  join(
    process.cwd(),
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/CatalogOnlyAiIdentificationHistoryPanel.tsx',
  ),
  'utf8',
);
assert.ok(panel.includes('CATALOG_ONLY_HISTORY_PRIOR_LABEL'));
assert.ok(panel.includes('Referência técnica'));
assert.ok(panel.includes('Adicionar fatores selecionados'));
assert.ok(
  panel.includes("selectedLinkable > 0 ? 'contained' : 'outlined'"),
);
assert.ok(panel.includes('resolveCatalogOnlyHistoryItemLinkState'));
assert.ok(panel.includes('Já vinculado atualmente'));
assert.ok(panel.includes('Indisponível ou inativo no catálogo'));
assert.ok(panel.includes('nunca inclui automaticamente'));
assert.equal(panel.includes('Validado pela IA'), false);

console.log('catalog-only-history-prior-label.constants.spec.ts OK');
