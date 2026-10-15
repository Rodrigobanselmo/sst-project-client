/**
 * Visibilidade condicional dos avisos de PDF temporário.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddCharacterization/components/AiTemporaryPdfSourceField/ai-temporary-pdf-privacy-alerts-visibility.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const fieldSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/AiTemporaryPdfSourceField/AiTemporaryPdfSourceField.tsx',
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
const assistSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/CharacterizationAiAssistModal/CharacterizationAiAssistModal.tsx',
  'utf8',
);

assert(
  fieldSource.includes('showPrivacyAlertsOnlyWhenSelected?: boolean'),
  'prop opt-in no componente compartilhado',
);
assert(
  fieldSource.includes('showPrivacyAlertsOnlyWhenSelected = false'),
  'default false preserva consumidores legados',
);
assert(
  fieldSource.includes(
    '!showPrivacyAlertsOnlyWhenSelected || Boolean(value)',
  ),
  'avisos só quando selecionado no modo opt-in',
);
assert(
  fieldSource.includes('{showPrivacyAlerts && ('),
  'render condicional dos dois Alert de privacidade',
);

assert(
  gseSource.includes('showPrivacyAlertsOnlyWhenSelected'),
  'Análise geral GSE ativa o modo condicional',
);
assert(
  elementoSource.includes('showPrivacyAlertsOnlyWhenSelected'),
  'Análise geral Elemento ativa o modo condicional',
);

const assistFieldIdx = assistSource.indexOf('<AiTemporaryPdfSourceField');
assert(assistFieldIdx >= 0, 'Assistente ainda usa o campo');
const assistSnippet = assistSource.slice(assistFieldIdx, assistFieldIdx + 500);
assert(
  !assistSnippet.includes('showPrivacyAlertsOnlyWhenSelected'),
  'Assistente não altera o comportamento legado',
);

console.log('ai-temporary-pdf-privacy-alerts-visibility.spec.ts OK');
