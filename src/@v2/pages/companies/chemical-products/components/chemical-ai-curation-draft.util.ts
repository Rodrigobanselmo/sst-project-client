import type {
  AiCurationSuggestion,
  ChemicalAiCurationIdentity,
  ChemicalAiCurationPendingItem,
  ChemicalAiCurationSplitPart,
  ChemicalAiCurationSplitPartResolution,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { displayOfficialName } from './chemical-ai-curation-ui.util';
import {
  isValidCasRn,
  softNormalizeCas,
} from './chemical-curation-create-risk.util';

/** Escopo: item normal = sourceRowId; parte = sourceRowId::partId */
export function curationDraftScopeKey(
  sourceRowId: string,
  partId?: string | null,
): string {
  if (partId) return `${sourceRowId}::${partId}`;
  return sourceRowId;
}

export function parseCurationDraftScopeKey(scopeKey: string): {
  sourceRowId: string;
  partId: string | null;
} {
  const sep = scopeKey.indexOf('::');
  if (sep < 0) return { sourceRowId: scopeKey, partId: null };
  return {
    sourceRowId: scopeKey.slice(0, sep),
    partId: scopeKey.slice(sep + 2) || null,
  };
}

export type ChemicalCurationIdentityDraft = {
  officialName: string;
  cas: string | null;
  synonyms: string[];
  origin: 'AI' | 'HUMAN';
  manualSource?: string;
  manualJustification?: string;
  originalSuggestion?: {
    officialName?: string;
    cas?: string | null;
  };
  identityConfirmed: boolean;
};

export type ChemicalCurationSplitPartDraft = {
  partId: string;
  include: boolean;
  originalText: string;
  resolution?: ChemicalAiCurationSplitPartResolution;
};

export type CasClientIssueKind = 'format' | 'checkdigit';

export function validateCasClientFeedback(raw: string | null | undefined): {
  normalized: string;
  empty: boolean;
  ok: boolean;
  issue: CasClientIssueKind | null;
  message: string | null;
} {
  const trimmed = String(raw || '').trim();
  if (!trimmed) {
    return {
      normalized: '',
      empty: true,
      ok: true,
      issue: null,
      message: null,
    };
  }
  const { value: normalized } = softNormalizeCas(trimmed);
  if (!/^\d{2,7}-\d{2}-\d$/.test(normalized)) {
    return {
      normalized,
      empty: false,
      ok: false,
      issue: 'format',
      message:
        'CAS com formato inválido. Use o padrão 1234567-12-1 (hífens corretos).',
    };
  }
  if (!isValidCasRn(normalized)) {
    return {
      normalized,
      empty: false,
      ok: false,
      issue: 'checkdigit',
      message:
        'CAS com dígito verificador inválido. Confira os números; a normalização não altera dígitos.',
    };
  }
  return {
    normalized,
    empty: false,
    ok: true,
    issue: null,
    message: null,
  };
}

export function synonymsEqual(a: string[] = [], b: string[] = []): boolean {
  const na = a.map((s) => s.trim()).filter(Boolean);
  const nb = b.map((s) => s.trim()).filter(Boolean);
  if (na.length !== nb.length) return false;
  return na.every((s, i) => s === nb[i]);
}

export function hasManualIdentityEdits(
  draft: ChemicalCurationIdentityDraft,
): boolean {
  const origName = draft.originalSuggestion?.officialName ?? '';
  const origCas =
    draft.originalSuggestion?.cas === undefined ||
    draft.originalSuggestion?.cas === null
      ? ''
      : String(draft.originalSuggestion.cas);
  const currentCas = draft.cas == null ? '' : String(draft.cas);
  if (draft.officialName.trim() !== String(origName).trim()) return true;
  if (currentCas.trim() !== origCas.trim()) return true;
  if ((draft.manualSource || '').trim()) return true;
  if ((draft.manualJustification || '').trim()) return true;
  return false;
}

export function detectHumanIdentityEdits(params: {
  draft: ChemicalCurationIdentityDraft;
  aiSynonyms?: string[];
}): boolean {
  if (hasManualIdentityEdits(params.draft)) return true;
  return !synonymsEqual(params.draft.synonyms, params.aiSynonyms || []);
}

export function buildIdentityDraftFromSuggestion(params: {
  suggestion: AiCurationSuggestion;
  pending: ChemicalAiCurationPendingItem;
  candidateIndex?: number;
}): ChemicalCurationIdentityDraft {
  const idx = params.candidateIndex ?? 0;
  const top =
    params.suggestion.type === 'SPLIT_COMPONENT'
      ? params.suggestion.splitCandidates?.[idx]
      : params.suggestion.candidates?.[0];
  const officialName =
    displayOfficialName(top?.officialName) ||
    params.pending.componentOriginal ||
    '';
  const cas = top?.cas ?? null;
  const synonyms = [...(top?.synonyms || [])];
  return {
    officialName,
    cas,
    synonyms,
    origin: 'AI',
    manualSource: '',
    manualJustification: '',
    originalSuggestion: {
      officialName: displayOfficialName(top?.officialName) || undefined,
      cas: top?.cas ?? null,
    },
    identityConfirmed: false,
  };
}

export function buildSplitPartDraftsFromSuggestion(
  suggestion: AiCurationSuggestion,
): ChemicalCurationSplitPartDraft[] {
  const candidates = suggestion.splitCandidates || [];
  return candidates.map((c, index) => {
    const official =
      displayOfficialName(c.officialName) || `Parte ${index + 1}`;
    const partId = `p${index + 1}-${slugPartId(official)}`;
    return {
      partId,
      include: true,
      originalText: displayOfficialName(c.officialName) || official,
      resolution: undefined,
    };
  });
}

function slugPartId(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'part'
  );
}

export function validateIdentityDraftForConfirm(
  draft: ChemicalCurationIdentityDraft,
): { ok: boolean; message: string | null } {
  const name = draft.officialName.trim();
  if (!name) {
    return {
      ok: false,
      message: 'Informe o nome químico antes de confirmar a identidade.',
    };
  }
  const casCheck = validateCasClientFeedback(draft.cas);
  if (!casCheck.ok) {
    return { ok: false, message: casCheck.message };
  }
  if (casCheck.normalized && !name) {
    return {
      ok: false,
      message: 'Não é permitido CAS preenchido com nome vazio.',
    };
  }
  return { ok: true, message: null };
}

export function applyIdentityDraftEdit(
  prev: ChemicalCurationIdentityDraft,
  patch: Partial<
    Pick<
      ChemicalCurationIdentityDraft,
      | 'officialName'
      | 'cas'
      | 'synonyms'
      | 'manualSource'
      | 'manualJustification'
    >
  >,
  aiSynonyms: string[] = [],
): ChemicalCurationIdentityDraft {
  const next: ChemicalCurationIdentityDraft = {
    ...prev,
    ...patch,
  };
  const human = detectHumanIdentityEdits({ draft: next, aiSynonyms });
  next.origin = human ? 'HUMAN' : 'AI';
  if (
    patch.officialName !== undefined ||
    patch.cas !== undefined ||
    patch.synonyms !== undefined
  ) {
    next.identityConfirmed = false;
  }
  return next;
}

export function confirmIdentityDraft(
  draft: ChemicalCurationIdentityDraft,
  aiSynonyms: string[] = [],
): { draft: ChemicalCurationIdentityDraft; error: string | null } {
  const withNorm: ChemicalCurationIdentityDraft = {
    ...draft,
    officialName: draft.officialName.trim(),
    cas: (() => {
      const check = validateCasClientFeedback(draft.cas);
      if (check.empty) return null;
      return check.normalized || null;
    })(),
    synonyms: draft.synonyms.map((s) => s.trim()).filter(Boolean),
    manualSource: (draft.manualSource || '').trim() || undefined,
    manualJustification:
      (draft.manualJustification || '').trim() || undefined,
  };
  const human = detectHumanIdentityEdits({
    draft: withNorm,
    aiSynonyms,
  });
  withNorm.origin = human ? 'HUMAN' : 'AI';
  const validation = validateIdentityDraftForConfirm(withNorm);
  if (!validation.ok) {
    return { draft: withNorm, error: validation.message };
  }
  return {
    draft: { ...withNorm, identityConfirmed: true },
    error: null,
  };
}

export function draftToApiIdentity(
  draft: ChemicalCurationIdentityDraft,
): ChemicalAiCurationIdentity {
  return {
    officialName: draft.officialName.trim(),
    cas: draft.cas,
    synonyms: draft.synonyms.map((s) => s.trim()).filter(Boolean),
    origin: draft.origin,
    manualSource: draft.manualSource || undefined,
    manualJustification: draft.manualJustification || undefined,
    originalSuggestion: draft.originalSuggestion,
  };
}

export function requiresIdentityConfirmationBeforeTerminal(params: {
  draft: ChemicalCurationIdentityDraft | undefined;
  aiSynonyms?: string[];
}): boolean {
  if (!params.draft) return false;
  if (params.draft.identityConfirmed) return false;
  return detectHumanIdentityEdits({
    draft: params.draft,
    aiSynonyms: params.aiSynonyms || [],
  });
}

/**
 * Itens que NÃO podem ir no “Confirmar selecionados” legado:
 * rascunho manual, identidade confirmada aguardando resolução, pré-vínculo ou split.
 * Não descarta rascunhos — só exclui do lote.
 */
export function isBlockedFromLegacyBatchConfirm(params: {
  suggestionType?: string | null;
  splitCandidatesCount?: number;
  identityDraft?: ChemicalCurationIdentityDraft | null;
  aiSynonyms?: string[];
  hasPendingManualFactor?: boolean;
  splitPartsCount?: number;
}): boolean {
  if (params.suggestionType === 'SPLIT_COMPONENT') return true;
  if ((params.splitCandidatesCount || 0) > 0) return true;
  if ((params.splitPartsCount || 0) > 0) return true;
  if (params.hasPendingManualFactor) return true;

  const draft = params.identityDraft;
  if (!draft) return false;
  // Identidade já confirmada (ainda sem decisão final) exige revisão individual.
  if (draft.identityConfirmed) return true;
  // Edição manual pendente de confirmação.
  if (
    detectHumanIdentityEdits({
      draft,
      aiSynonyms: params.aiSynonyms || [],
    })
  ) {
    return true;
  }
  return false;
}

export function isSplitReadyToConfirm(params: {
  parts: ChemicalCurationSplitPartDraft[];
  identityByScope: Record<string, ChemicalCurationIdentityDraft>;
  sourceRowId: string;
}): boolean {
  const { parts, identityByScope, sourceRowId } = params;
  if (parts.length < 2) return false;
  return parts.every((part) => {
    if (!part.resolution) return false;
    if (part.resolution.action === 'REJECT_PART') return true;
    const draft =
      identityByScope[curationDraftScopeKey(sourceRowId, part.partId)];
    if (!draft?.identityConfirmed) return false;
    if (part.resolution.action === 'MANUAL_FACTOR') {
      return Boolean(part.resolution.riskFactorId);
    }
    if (part.resolution.action === 'KEEP_UNLINKED') return true;
    return false;
  });
}

export function buildConfirmSplitParts(params: {
  parts: ChemicalCurationSplitPartDraft[];
  identityByScope: Record<string, ChemicalCurationIdentityDraft>;
  sourceRowId: string;
}): ChemicalAiCurationSplitPart[] {
  return params.parts.map((part) => {
    const draft =
      params.identityByScope[
        curationDraftScopeKey(params.sourceRowId, part.partId)
      ];
    const rejected = part.resolution?.action === 'REJECT_PART';
    const identity = draft ? draftToApiIdentity(draft) : undefined;
    return {
      partId: part.partId,
      include: !rejected,
      originalText: part.originalText,
      officialName: draft?.officialName?.trim() || part.originalText,
      cas: draft?.cas ?? null,
      riskFactorId:
        part.resolution?.action === 'MANUAL_FACTOR'
          ? part.resolution.riskFactorId || null
          : null,
      identity: rejected ? undefined : identity,
      resolution: part.resolution,
    };
  });
}
