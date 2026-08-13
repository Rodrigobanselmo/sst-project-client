/**
 * Testes pontuais da concatenação de transcrição em userGuidance.
 * Executar: npx tsx src/components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util.spec.ts
 */
import { appendTranscribedGuidance } from './append-transcribed-guidance.util';

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(
  appendTranscribedGuidance('', 'Exposição a óleo diesel') ===
    'Exposição a óleo diesel',
  'campo vazio deve receber a transcrição',
);

assert(
  appendTranscribedGuidance('   ', 'Avaliar postura sentada') ===
    'Avaliar postura sentada',
  'campo só com espaços deve receber a transcrição',
);

assert(
  appendTranscribedGuidance(
    'Avaliar ruído.',
    'Exposição aos vapores de óleo diesel.',
  ) === 'Avaliar ruído.\nExposição aos vapores de óleo diesel.',
  'campo preenchido deve concatenar com quebra de linha',
);

assert(
  appendTranscribedGuidance('Texto atual', '   ') === 'Texto atual',
  'transcrição vazia não deve alterar o campo',
);

console.log('append-transcribed-guidance.util.spec.ts OK');
