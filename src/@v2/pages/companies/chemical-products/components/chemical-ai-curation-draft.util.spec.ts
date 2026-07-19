import { describe, expect, it } from '@jest/globals';

import {
  applyIdentityDraftEdit,
  buildConfirmSplitParts,
  buildIdentityDraftFromSuggestion,
  buildSplitPartDraftsFromSuggestion,
  confirmIdentityDraft,
  curationDraftScopeKey,
  detectHumanIdentityEdits,
  isBlockedFromLegacyBatchConfirm,
  isSplitReadyToConfirm,
  requiresIdentityConfirmationBeforeTerminal,
  validateCasClientFeedback,
  type ChemicalCurationIdentityDraft,
  type ChemicalCurationSplitPartDraft,
} from './chemical-ai-curation-draft.util';
import type {
  AiCurationSuggestion,
  ChemicalAiCurationPendingItem,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

function pending(
  overrides: Partial<ChemicalAiCurationPendingItem> = {},
): ChemicalAiCurationPendingItem {
  return {
    sourceRowId: 'row-1',
    sourceRow: 2,
    sourceSheet: 'Sheet',
    tradeName: 'P',
    manufacturer: null,
    componentOriginal: 'ACETONA TECNICA',
    componentNormalized: 'ACETONA TECNICA',
    casReceived: null,
    matchStatus: 'REVIEW_REQUIRED',
    concentrationKindLabel: 'NÃO INFORMADA',
    exactPercent: null,
    minPercent: null,
    maxPercent: null,
    observation: null,
    deterministicCandidates: [],
    ...overrides,
  };
}

function suggestion(
  overrides: Partial<AiCurationSuggestion> = {},
): AiCurationSuggestion {
  return {
    sourceRowId: 'row-1',
    originalText: 'ACETONA TECNICA',
    type: 'CHEMICAL_IDENTITY',
    candidates: [
      {
        officialName: 'Acetona',
        cas: '67-64-1',
        synonyms: ['propanona'],
        confidence: 'HIGH',
        rationale: 'ok',
        warnings: [],
        evidences: [],
      },
    ],
    confidence: 'HIGH',
    rationale: 'ok',
    requiresHumanConfirmation: true,
    ...overrides,
  };
}

describe('chemical-ai-curation-draft.util', () => {
  it('diferencia formato e dígito verificador de CAS', () => {
    expect(validateCasClientFeedback('abc').issue).toBe('format');
    expect(validateCasClientFeedback('67-64-2').issue).toBe('checkdigit');
    expect(validateCasClientFeedback('67-64-1').ok).toBe(true);
  });

  it('Confirmar identidade não exige terminal; edição invalida confirmação', () => {
    const draft = buildIdentityDraftFromSuggestion({
      suggestion: suggestion(),
      pending: pending(),
    });
    const confirmed = confirmIdentityDraft(draft, ['propanona']);
    expect(confirmed.error).toBeNull();
    expect(confirmed.draft.identityConfirmed).toBe(true);

    const edited = applyIdentityDraftEdit(
      confirmed.draft,
      { officialName: 'Acetona P.A.' },
      ['propanona'],
    );
    expect(edited.identityConfirmed).toBe(false);
    expect(edited.origin).toBe('HUMAN');
    expect(
      requiresIdentityConfirmationBeforeTerminal({
        draft: edited,
        aiSynonyms: ['propanona'],
      }),
    ).toBe(true);
  });

  it('CAS null explícito e nome obrigatório', () => {
    const draft: ChemicalCurationIdentityDraft = {
      officialName: '',
      cas: '67-64-1',
      synonyms: [],
      origin: 'HUMAN',
      identityConfirmed: false,
      originalSuggestion: { officialName: 'Acetona', cas: '67-64-1' },
    };
    expect(confirmIdentityDraft(draft).error).toMatch(/nome químico/i);

    const ok = confirmIdentityDraft({
      ...draft,
      officialName: 'Sem CAS',
      cas: null,
    });
    expect(ok.error).toBeNull();
    expect(ok.draft.cas).toBeNull();
  });

  it('split só fica pronto com resoluções e identidades confirmadas', () => {
    const splitSuggestion = suggestion({
      type: 'SPLIT_COMPONENT',
      splitCandidates: [
        {
          officialName: 'A',
          cas: '67-56-1',
          synonyms: [],
          confidence: 'HIGH',
          rationale: '',
          warnings: [],
          evidences: [],
        },
        {
          officialName: 'B',
          cas: '67-64-1',
          synonyms: [],
          confidence: 'HIGH',
          rationale: '',
          warnings: [],
          evidences: [],
        },
      ],
      candidates: [],
    });
    const parts = buildSplitPartDraftsFromSuggestion(splitSuggestion);
    expect(parts).toHaveLength(2);
    expect(parts[0]?.partId).toMatch(/^p1-/);

    const identities: Record<string, ChemicalCurationIdentityDraft> = {};
    parts.forEach((part, index) => {
      const key = curationDraftScopeKey('row-1', part.partId);
      identities[key] = {
        ...buildIdentityDraftFromSuggestion({
          suggestion: splitSuggestion,
          pending: pending(),
          candidateIndex: index,
        }),
        identityConfirmed: true,
      };
    });

    const unresolved: ChemicalCurationSplitPartDraft[] = parts.map((p) => ({
      ...p,
    }));
    expect(
      isSplitReadyToConfirm({
        parts: unresolved,
        identityByScope: identities,
        sourceRowId: 'row-1',
      }),
    ).toBe(false);

    const resolved: ChemicalCurationSplitPartDraft[] = [
      {
        ...parts[0]!,
        resolution: { action: 'KEEP_UNLINKED' },
      },
      {
        ...parts[1]!,
        resolution: {
          action: 'MANUAL_FACTOR',
          riskFactorId: 'rf-1',
        },
      },
    ];
    expect(
      isSplitReadyToConfirm({
        parts: resolved,
        identityByScope: identities,
        sourceRowId: 'row-1',
      }),
    ).toBe(true);

    const payload = buildConfirmSplitParts({
      parts: resolved,
      identityByScope: identities,
      sourceRowId: 'row-1',
    });
    expect(payload[0]?.partId).toBe(parts[0]?.partId);
    expect(payload[0]?.resolution?.action).toBe('KEEP_UNLINKED');
    expect(payload[1]?.resolution?.action).toBe('MANUAL_FACTOR');
    expect(payload[0]?.identity?.origin).toBeDefined();
  });

  it('legado sem edição não bloqueia decisão terminal', () => {
    const draft = buildIdentityDraftFromSuggestion({
      suggestion: suggestion(),
      pending: pending(),
    });
    expect(detectHumanIdentityEdits({ draft, aiSynonyms: ['propanona'] })).toBe(
      false,
    );
    expect(
      requiresIdentityConfirmationBeforeTerminal({
        draft,
        aiSynonyms: ['propanona'],
      }),
    ).toBe(false);
  });

  it('bloqueia lote legado com rascunho/pré-vínculo/split; preserva legado limpo', () => {
    const clean = buildIdentityDraftFromSuggestion({
      suggestion: suggestion(),
      pending: pending(),
    });
    expect(
      isBlockedFromLegacyBatchConfirm({
        suggestionType: 'CHEMICAL_IDENTITY',
        identityDraft: clean,
        aiSynonyms: ['propanona'],
      }),
    ).toBe(false);

    expect(
      isBlockedFromLegacyBatchConfirm({
        suggestionType: 'CHEMICAL_IDENTITY',
        identityDraft: { ...clean, officialName: 'Editado', origin: 'HUMAN' },
        aiSynonyms: ['propanona'],
      }),
    ).toBe(true);

    expect(
      isBlockedFromLegacyBatchConfirm({
        suggestionType: 'EXISTING_RISK_MATCH',
        identityDraft: { ...clean, identityConfirmed: true },
      }),
    ).toBe(true);

    expect(
      isBlockedFromLegacyBatchConfirm({
        suggestionType: 'EXISTING_RISK_MATCH',
        identityDraft: clean,
        hasPendingManualFactor: true,
      }),
    ).toBe(true);

    expect(
      isBlockedFromLegacyBatchConfirm({
        suggestionType: 'SPLIT_COMPONENT',
        splitCandidatesCount: 2,
        splitPartsCount: 2,
      }),
    ).toBe(true);
  });
});
