/**
 * Etapa 2 — probabilidade sugerida na coluna Probabilidade.
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factor-ai-probability-column.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const pendingUtil = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factor-ai-pending.util.ts',
  'utf8',
);
const column = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/columns/ProbabilityColumn/index.tsx',
  'utf8',
);
const list = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/RiskFactorAiPendingList.tsx',
  'utf8',
);
const actions = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/useRiskFactorAiSuggestionActions.ts',
  'utf8',
);
const form = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoFormContent.tsx',
  'utf8',
);
const gse = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent.tsx',
  'utf8',
);

assert(pendingUtil.includes("probability: ['probability']"), 'coluna probability mapeada');
assert(
  pendingUtil.includes("return { probability };"),
  'payload de aprovação só com probability',
);
assert(
  pendingUtil.includes('column === \'probability\'') ||
    pendingUtil.includes('column === "probability"') ||
    pendingUtil.includes("column === 'probability'"),
  'aba antiga mantém probabilidade no modal',
);
assert(column.includes('RiskFactorAiPendingList'), 'lista pendente na coluna');
assert(column.includes('column="probability"'), 'coluna correta');
assert(list.includes('Aprovar P${value}'), 'ação Aprovar P{n}');
assert(list.includes('Probabilidade sugerida pela IA'), 'rótulo da sugestão');
assert(actions.includes("suggestion.action === 'approve-probability'"), 'confirmação antes de gravar');
assert(
  form.includes('aiRiskAnalysis={gseAi.analysis}') &&
    gse.includes("presentation = 'full'"),
  'aba antiga intacta',
);

console.log('risk-factor-ai-probability-column.spec.ts OK');
