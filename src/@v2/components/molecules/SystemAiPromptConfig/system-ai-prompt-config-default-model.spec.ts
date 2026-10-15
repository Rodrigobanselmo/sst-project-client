/**
 * Contrato do default visual do seletor MASTER.
 * Executar:
 * npx tsx src/@v2/components/molecules/SystemAiPromptConfig/system-ai-prompt-config-default-model.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const dialogSource = readFileSync(
  'src/@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog.tsx',
  'utf8',
);
const gseSource = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent.tsx',
  'utf8',
);
const elementoSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ModalAiAnalysisContent.tsx',
  'utf8',
);

assert(
  dialogSource.includes('defaultModelValue?: string'),
  'prop opcional defaultModelValue',
);
assert(
  dialogSource.includes('LEGACY_DEFAULT_MODEL'),
  'legado gpt-4o-mini permanece para consumidores sem prop',
);
assert(
  dialogSource.includes("option.value === 'gpt-4o-mini'"),
  'fallback legado continua gpt-4o-mini',
);
assert(
  gseSource.includes('defaultModelValue="gpt-5-mini"'),
  'GSE operacional usa gpt-5-mini no seletor',
);
assert(
  gseSource.includes('initialConfig={aiMasterConfig}'),
  'GSE reabre com config de sessão',
);
assert(
  elementoSource.includes('defaultModelValue="gpt-5-mini"'),
  'Elemento operacional usa gpt-5-mini no seletor',
);
assert(
  elementoSource.includes('initialConfig={aiMasterConfig}'),
  'Elemento reabre com config de sessão',
);
assert(
  gseSource.includes('presentation="risksTabDialog"') ||
    gseSource.includes("presentation === 'risksTabDialog'"),
  'etapa 1 do diálogo Fatores preservada',
);

console.log('system-ai-prompt-config-default-model.spec.ts OK');
