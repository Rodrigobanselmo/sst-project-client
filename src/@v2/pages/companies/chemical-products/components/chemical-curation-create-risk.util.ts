import { PermissionEnum } from 'project/enum/permission.enum';
import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

import type {
  AiCurationConfidence,
  AiCurationSuggestion,
  AiCurationSuggestionType,
  ChemicalAiCurationPendingItem,
  ChemicalRiskOption,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

/**
 * CAS RN check-digit — espelho pontual do validador do módulo químico (API).
 * Não altera o schema Yup legado fora deste fluxo.
 */
export function isValidCasRn(cas: string): boolean {
  const trimmed = String(cas || '').trim();
  if (!/^\d{2,7}-\d{2}-\d$/.test(trimmed)) return false;
  const digits = trimmed.replace(/-/g, '');
  const check = Number(digits.slice(-1));
  const body = digits.slice(0, -1).split('').reverse();
  if (!body.length || !Number.isFinite(check)) return false;
  const sum = body.reduce(
    (acc, digit, index) => acc + Number(digit) * (index + 1),
    0,
  );
  return sum % 10 === check;
}

/** Normalização segura de CAS (espaços/hífens); não altera dígitos. */
export function softNormalizeCas(raw: string | null | undefined): {
  value: string;
  changed: boolean;
} {
  const original = String(raw || '').trim();
  if (!original) return { value: '', changed: false };

  let value = original.replace(/\s+/g, '').replace(/[–—−‐‑]/g, '-');

  if (/^\d{5,10}$/.test(value)) {
    const check = value.slice(-1);
    const mid = value.slice(-3, -1);
    const first = value.slice(0, -3);
    value = `${first}-${mid}-${check}`;
  }

  value = value.replace(/-+/g, '-');
  return { value, changed: value !== original.replace(/\s+/g, '') };
}

export function canCreateChemicalRiskPermission(params: {
  isAuthSuccess: (args: {
    permissions?: PermissionEnum[];
    cruds?: string;
  }) => boolean;
}): boolean {
  return params.isAuthSuccess({
    permissions: [PermissionEnum.RISK],
    cruds: 'c',
  });
}

export function hasSufficientCreateRiskContext(params: {
  pending: ChemicalAiCurationPendingItem;
  suggestion?: AiCurationSuggestion | null;
}): boolean {
  const official =
    params.suggestion?.candidates?.[0]?.officialName?.trim() ||
    params.suggestion?.splitCandidates?.[0]?.officialName?.trim() ||
    '';
  const original = params.pending.componentOriginal?.trim() || '';
  return Boolean(official || original);
}

export function shouldShowCreateChemicalRiskButton(params: {
  canCreateRisk: boolean;
  pending: ChemicalAiCurationPendingItem;
  suggestion?: AiCurationSuggestion | null;
  hasAppliedDecision: boolean;
  /** Fator já pré-selecionado (create/busca) aguardando confirmação. */
  hasPendingManualFactor?: boolean;
}): boolean {
  if (!params.canCreateRisk) return false;
  if (params.hasAppliedDecision) return false;
  if (params.hasPendingManualFactor) return false;
  if (!hasSufficientCreateRiskContext(params)) return false;

  const top = params.suggestion?.candidates?.[0];
  if (top?.riskFactorId) return false;
  if (params.suggestion?.type === 'EXISTING_RISK_MATCH' && top?.riskFactorId) {
    return false;
  }
  return true;
}

export type ChemicalCurationPendingManualFactor = {
  riskFactorId: string;
  officialName: string;
  cas: string | null;
};

export type ChemicalCurationCreateRiskPrefill = {
  id: '';
  companyId: string;
  type: RiskEnum;
  name: string;
  cas?: string;
  synonymous: string[];
  severity: number;
  status: StatusEnum;
  recMed: [];
  generateSource: [];
  hasSubmit: false;
  isEmergency: false;
};

/** Detecta texto já disponível com sinais de português — não traduz. */
export function looksPortugueseChemicalName(text: string): boolean {
  const value = String(text || '').trim();
  if (!value) return false;
  if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(value)) return true;
  return /\b(ácido|acido|acetato|etílico|etila|metila|perclórico|perclorico|sulfâmico|sulfamico|sulfúrico|sulfurico|hidróxido|hidroxido|cloreto|nitrato|fosfato)\b/i.test(
    value,
  );
}

/**
 * Prioriza nome canônico em português entre valores já disponíveis
 * (officialName, sinônimos, evidências, nome da planilha). Não inventa tradução.
 */
export function resolveChemicalCurationPrefillName(params: {
  officialName?: string | null;
  synonyms?: string[];
  originalName?: string | null;
  evidenceNames?: string[];
}): { name: string; synonyms: string[] } {
  const official = String(params.officialName || '').trim();
  const original = String(params.originalName || '').trim();
  const fromSynonyms = (params.synonyms || [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  const fromEvidence = (params.evidenceNames || [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  const pool = [official, ...fromSynonyms, ...fromEvidence, original].filter(
    Boolean,
  );
  const portuguese = pool.find(looksPortugueseChemicalName) || '';
  const name = portuguese || official || original;

  const synonyms = Array.from(
    new Set(
      pool.filter(
        (value) => value.toLowerCase() !== name.toLowerCase(),
      ),
    ),
  );

  return { name, synonyms };
}

export function buildChemicalCurationCreateRiskPrefill(params: {
  companyId: string;
  pending: ChemicalAiCurationPendingItem;
  suggestion?: AiCurationSuggestion | null;
}): ChemicalCurationCreateRiskPrefill {
  const top = params.suggestion?.candidates?.[0];
  const officialName =
    top?.officialName?.trim() ||
    params.suggestion?.splitCandidates?.[0]?.officialName?.trim() ||
    '';
  const originalName = params.pending.componentOriginal?.trim() || '';

  const evidenceNames = (top?.evidences || [])
    .filter((evidence) =>
      ['officialName', 'name', 'synonyms'].includes(evidence.field),
    )
    .flatMap((evidence) =>
      [evidence.value, evidence.excerpt]
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    );

  const { name, synonyms } = resolveChemicalCurationPrefillName({
    officialName,
    synonyms: top?.synonyms || [],
    originalName,
    evidenceNames,
  });

  const rawCas =
    top?.cas ||
    params.suggestion?.splitCandidates?.[0]?.cas ||
    params.pending.casReceived ||
    null;
  const normalizedCas = softNormalizeCas(rawCas).value;
  const cas =
    normalizedCas && isValidCasRn(normalizedCas) ? normalizedCas : undefined;

  return {
    id: '',
    companyId: params.companyId,
    type: RiskEnum.QUI,
    name,
    cas,
    synonymous: synonyms,
    severity: 0,
    status: StatusEnum.ACTIVE,
    recMed: [],
    generateSource: [],
    hasSubmit: false,
    isEmergency: false,
  };
}

export function filterRisksWithSameCas(
  risks: ChemicalRiskOption[],
  cas: string,
): ChemicalRiskOption[] {
  const normalized = softNormalizeCas(cas).value;
  if (!normalized) return [];
  return risks.filter(
    (risk) => softNormalizeCas(risk.cas).value === normalized,
  );
}

export function buildManualFactorDecision(params: {
  sourceRowId: string;
  createdRisk: { id: string; name: string; cas?: string | null };
  confirmedCas?: string | null;
  suggestionType?: AiCurationSuggestionType | null;
  confidence?: AiCurationConfidence | null;
}) {
  return {
    sourceRowId: params.sourceRowId,
    action: 'MANUAL_FACTOR' as const,
    riskFactorId: params.createdRisk.id,
    officialName: params.createdRisk.name,
    cas: params.createdRisk.cas ?? params.confirmedCas ?? null,
    suggestionType: params.suggestionType ?? null,
    confidence: params.confidence ?? null,
  };
}
