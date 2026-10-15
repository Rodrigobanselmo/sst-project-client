/**
 * Bloco A — seleção de fotos na Análise geral com IA (Elemento).
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/modal-ai-analysis-photo-selection.spec.ts
 */
import { readFileSync } from 'fs';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const source = readFileSync(
  'src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ModalAiAnalysisContent.tsx',
  'utf8',
);

assert(
  source.includes('CatalogOnlyCharacterizationPhotosField'),
  'reutiliza CatalogOnlyCharacterizationPhotosField',
);
assert(
  source.includes('photoSelection:'),
  'envia photoSelection no request operacional',
);
assert(
  source.includes('existingPhotoIds: [...selectedExistingPhotoIds]'),
  'repassa ids das fotos selecionadas',
);
assert(
  source.includes('temporaryImages: temporaryImages.map'),
  'repassa imagens temporárias só na chamada',
);
assert(
  source.includes('defaultModelValue="gpt-5-mini"'),
  'preserva seletor operacional gpt-5-mini',
);
assert(
  !source.includes("suggestionMode: 'catalog-only'"),
  'não força catalog-only na análise operacional',
);

console.log('modal-ai-analysis-photo-selection.spec.ts OK');
