import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatCatalogOnlyAiExperimentDiagnosticsLines,
  resolveCatalogOnlyAiExperimentDiagnostics,
} from './catalog-only-ai-experiment-diagnostics.util';

describe('catalog-only-ai-experiment-diagnostics', () => {
  it('extrai campos de metadata sem conteúdo sensível', () => {
    const diagnostics = resolveCatalogOnlyAiExperimentDiagnostics({
      model: 'gpt-4o',
      selectedImageCount: 4,
      imagesSentToModelCount: 4,
      imageFallbackApplied: false,
      imageFallbackTextOnly: false,
      totalAvailableRisks: 320,
      rawModelRisksCount: 5,
      parserAcceptedRisksCount: 4,
      parserDroppedUnknownIdCount: 1,
      identifiedAlreadyLinkedCount: 2,
      newRiskSuggestionsCount: 2,
      analysis: 'should-not-appear',
    });

    assert.ok(diagnostics);
    assert.equal(diagnostics!.model, 'gpt-4o');
    assert.equal(diagnostics!.selectedImageCount, 4);
    assert.equal(diagnostics!.newRiskSuggestionsCount, 2);

    const lines = formatCatalogOnlyAiExperimentDiagnosticsLines(diagnostics!);
    assert.ok(lines.some((line) => line.includes('gpt-4o')));
    assert.ok(lines.every((line) => !line.includes('should-not-appear')));
  });

  it('metadata ausente: null', () => {
    assert.equal(resolveCatalogOnlyAiExperimentDiagnostics(undefined), null);
  });
});
