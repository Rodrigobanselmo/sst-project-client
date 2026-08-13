/**
 * Garante paridade visual GSE/Elemento e persistência no gseId.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/components/gho-ai-analysis-actions.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const gseSource = readFileSync(
  'src/components/organisms/modals/ModalAddGHO/components/GhoAiAnalysisContent.tsx',
  'utf8',
);
const elementoSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ModalAiAnalysisContent.tsx',
  'utf8',
);
const cardSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiRiskSuggestionCard.tsx',
  'utf8',
);
const reviewSource = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiExistingRiskReviewCard.tsx',
  'utf8',
);

assert(
  gseSource.includes('AiRiskSuggestionCard'),
  'GSE deve renderizar o card compartilhado de novo risco',
);
assert(
  elementoSource.includes('AiRiskSuggestionCard'),
  'Elemento deve renderizar o mesmo card de novo risco',
);
assert(
  gseSource.includes('AiExistingRiskReviewCard'),
  'GSE deve renderizar o card compartilhado de revisão modular',
);
assert(
  elementoSource.includes('AiExistingRiskReviewCard'),
  'Elemento deve renderizar o mesmo card de revisão modular',
);

assert(cardSource.includes('text="Remover da lista"'), 'label Remover da lista');
assert(
  cardSource.includes("text={isAdded ? '✓ Adicionado' : 'Adicionar Risco'}"),
  'label Adicionar Risco',
);
assert(cardSource.includes('Probabilidade'), 'seletor de probabilidade no card');
assert(cardSource.includes('Fonte Geradora'), 'fonte geradora individual');
assert(cardSource.includes('Controles Existentes'), 'controles existentes');
assert(cardSource.includes('Medidas Recomendadas'), 'medidas recomendadas');
assert(cardSource.includes('AiRiskRemovableTag'), 'itens individualmente removíveis');
assert(cardSource.includes('edits.editProbability'), 'probabilidade editável antes do Add');

assert(reviewSource.includes("text={isApplied ? 'Aplicado' : 'Aplicar'}"), 'label Aplicar');
assert(gseSource.includes('text="Expandir todos"'), 'label Expandir todos');
assert(gseSource.includes('text="Recolher todos"'), 'label Recolher todos');

assert(gseSource.includes('handleAddRisk'), 'callback handleAddRisk permanece');
assert(gseSource.includes('buildGseAddRiskPayload'), 'payload GSE permanece');
assert(gseSource.includes('handleApplyModularSuggestion'), 'revisão modular permanece');
assert(gseSource.includes('dismissSuggestion'), 'dismissSuggestion permanece');
assert(
  gseSource.includes('getCurrentRisk(originalRisk.id)'),
  'Add do GSE usa o risco editado',
);
assert(
  gseSource.includes('homogeneousGroupId: gseId') ||
    gseSource.includes('gseId,'),
  'Add do GSE continua passando gseId',
);

assert(
  elementoSource.includes('homogeneousGroupId: characterizationData.id'),
  'Elemento continua persistindo no homogeneousGroupId do Elemento',
);
assert(
  !elementoSource.includes('buildGseAddRiskPayload'),
  'Elemento não usa o payload builder do GSE',
);

console.log('gho-ai-analysis-actions.spec.ts OK');
