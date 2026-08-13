/**
 * Payload da Análise de Riscos IA do GSE — PDF temporário e orientação.
 *
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/components/build-gse-ai-analyze-request.util.spec.ts
 */
import assert from 'node:assert/strict';

import { appendTranscribedGuidance } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util';
import { buildGseAiAnalyzeRequestBody } from './build-gse-ai-analyze-request.util';

const withPdf = buildGseAiAnalyzeRequestBody({
  userGuidance: '  Considere também os riscos deste documento.  ',
  temporaryDocumentSource: {
    kind: 'user_pdf',
    fileName: 'pgr.pdf',
    extractedText: 'Ruído e calor',
    charCount: 13,
    truncated: false,
  },
  customPrompt: 'prompt master',
  model: 'gpt-4o',
});

assert.equal(withPdf.userGuidance, 'Considere também os riscos deste documento.');
assert.equal(withPdf.temporaryDocumentSources?.length, 1);
assert.equal(withPdf.temporaryDocumentSources?.[0]?.fileName, 'pgr.pdf');
assert.equal(withPdf.customPrompt, 'prompt master');
assert.equal(withPdf.model, 'gpt-4o');

const withoutPdf = buildGseAiAnalyzeRequestBody({
  userGuidance: '',
  temporaryDocumentSource: null,
});

assert.equal(withoutPdf.userGuidance, undefined);
assert.equal(withoutPdf.temporaryDocumentSources, undefined);

assert.equal(
  appendTranscribedGuidance('Texto atual', 'Exposição a óleo diesel'),
  'Texto atual\nExposição a óleo diesel',
);
assert.equal(appendTranscribedGuidance('', 'Avaliar ruído'), 'Avaliar ruído');

console.log('build-gse-ai-analyze-request.util.spec.ts ok');
