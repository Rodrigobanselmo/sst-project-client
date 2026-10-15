/**
 * Etapa 1 — diálogo "Análise geral com IA" na aba Fatores de Riscos.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/components/gho-ai-analysis-risks-tab-dialog.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const gseSource = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent.tsx',
  'utf8',
);
const formSource = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoFormContent.tsx',
  'utf8',
);
const providerSource = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/RiskFactorsAiProvider.tsx',
  'utf8',
);

assert(
  gseSource.includes("presentation = 'full'"),
  'aba Análise de Riscos IA permanece presentation full por padrão',
);
assert(
  gseSource.includes("presentation === 'risksTabDialog'"),
  'modo risksTabDialog existe',
);
assert(
  gseSource.includes('Ver sugestões na tabela'),
  'CTA fecha o diálogo e devolve foco à tabela',
);
assert(
  gseSource.includes('Resumo das sugestões'),
  'resumo no diálogo da tabela',
);
assert(
  formSource.includes('presentation="risksTabDialog"'),
  'dialog da aba Fatores usa o modo focado',
);
assert(
  formSource.includes('<GhoAiAnalysisContent') &&
    formSource.includes('aiRiskAnalysis={gseAi.analysis}'),
  'aba antiga continua montando GhoAiAnalysisContent com estado compartilhado',
);
assert(
  !formSource.match(
    /presentation="risksTabDialog"[\s\S]*?<\/RiskFactorsAiProvider>[\s\S]*presentation="risksTabDialog"/,
  ),
  'apenas o renderGeneral do provider usa risksTabDialog',
);
assert(
  providerSource.includes('renderGeneral({ onClose:'),
  'provider passa onClose ao painel geral',
);

console.log('gho-ai-analysis-risks-tab-dialog.spec.ts OK');
