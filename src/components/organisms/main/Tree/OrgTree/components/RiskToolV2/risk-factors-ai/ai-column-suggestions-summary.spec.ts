/**
 * Etapa 4 — polimento UX do resumo com badges por coluna.
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/ai-column-suggestions-summary.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const summary = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/AiColumnSuggestionsSummary.tsx',
  'utf8',
);
const pendingList = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/RiskFactorAiPendingList.tsx',
  'utf8',
);
const pendingUtil = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factor-ai-pending.util.ts',
  'utf8',
);

assert(summary.includes('countPendingSuggestionsByColumn'), 'reutiliza contadores');
assert(
  summary.includes('ai-column-suggestions-summary-badges'),
  'badges no resumo',
);
assert(summary.includes('Chip'), 'Chip discreto por coluna');
assert(summary.includes('Confirmar que existe'), 'copy confirmar');
assert(summary.includes('Aceitar recomendação'), 'copy aceitar');
assert(summary.includes('Aprovar Pn'), 'copy aprovar Pn');
assert(
  !summary.includes('onCloseDialog') && !summary.includes('setTimeout'),
  'sem fechamento automático',
);

assert(pendingList.includes('pendingKindLabel'), 'rótulo de tipo na lista');
assert(pendingList.includes('Aprovar P${value}'), 'Aprovar Pn no botão e eyebrow');
assert(
  pendingList.includes("'confirm-existence': 'Confirmar que existe'"),
  'confirmar preservado',
);
assert(
  pendingList.includes("'accept-recommendation': 'Aceitar recomendação'"),
  'aceitar preservado',
);

assert(
  pendingUtil.includes('return { probability };'),
  'payload de probabilidade intacto',
);
assert(
  pendingUtil.includes('probabilityAfter'),
  'util ainda referencia residual só onde já existia (recs)',
);

console.log('ai-column-suggestions-summary.spec.ts OK');
