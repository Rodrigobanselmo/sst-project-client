import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dialog = readFileSync(
  join(
    process.cwd(),
    'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/SuggestCatalogRisksWithAiDialog.tsx',
  ),
  'utf8',
);

// Após análise: sugestões desmarcadas (não pré-seleciona accepted).
assert.ok(dialog.includes('setSelectedIds(new Set())'));
assert.equal(
  dialog.includes(
    'setSelectedIds(new Set(filtered.accepted.map((risk) => risk.id)))',
  ),
  false,
);

// Confirmar inclusão exige seleção explícita.
assert.ok(dialog.includes('!selectedIds.size'));
assert.ok(dialog.includes("disabled={\n            !context || !selectedIds.size"));

// Selecionar todos permanece como ação explícita.
assert.ok(dialog.includes('toggleAll'));
assert.ok(dialog.includes('Selecionar todos'));

// Mesmo diálogo compartilhado GSE/Elemento.
assert.ok(dialog.includes("context.kind === 'gse'"));
assert.ok(dialog.includes('characterization'));

// Origem e consideração técnica
assert.ok(dialog.includes('resolveCatalogOnlyOriginLabel'));
assert.ok(dialog.includes('resolveCatalogOnlyConsiderationLabel'));
assert.ok(dialog.includes('buildCatalogOnlyRiskLinkPayload'));

console.log('suggest-catalog-risks-selection.contract.spec.ts OK');
