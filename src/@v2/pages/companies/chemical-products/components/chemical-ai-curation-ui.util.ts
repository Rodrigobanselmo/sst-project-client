import type {
  AiCurationEvidence,
  AiCurationSuggestion,
  ChemicalAiCurationDecision,
  ChemicalAiCurationPendingItem,
  ChemicalPreparePreviewResult,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

const ISOMER_ALERT_RE =
  /\b(is[oô]mero|sal\b|hidrat|mistura|classe\s+gen[eé]rica|forma\s+qu[ií]mica|fator\s+interno\s+mais\s+amplo|agrupamento)\b/i;

export type CurationFilter =
  | 'ALL'
  | 'PROCESSED'
  | 'AWAITING'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INSUFFICIENT'
  | 'EXISTING'
  | 'IDENTITY'
  | 'SPLIT'
  | 'NO_MATCH'
  | 'REVIEW_REQUIRED'
  | 'INVALID_CAS'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'PENDING';

export const CURATION_QUEUE_PAGE_SIZE = 20;

export function hasAiCurationPendencies(
  preview: ChemicalPreparePreviewResult | null,
): boolean {
  if (!preview) return false;
  const fromCount = preview.aiCurationEligibleCount ?? 0;
  const fromItems = preview.pendingItems?.length ?? 0;
  const fromSummary =
    (preview.summary.reviewRequired || 0) +
    (preview.summary.noMatch || 0) +
    (preview.summary.invalidCas || 0);
  return Math.max(fromCount, fromItems, fromSummary) > 0;
}

/** Decisão que remove o item da fila ativa desta preparação. */
export function isAppliedCurationDecision(
  decision: ChemicalAiCurationDecision | null | undefined,
): boolean {
  if (!decision?.action) return false;
  return [
    'CONFIRM_EXISTING',
    'CONFIRM_SPLIT',
    'MANUAL_FACTOR',
    'KEEP_UNLINKED',
    'REJECT',
  ].includes(decision.action);
}

export function countAppliedCurationDecisions(
  decisions: Record<string, ChemicalAiCurationDecision>,
): number {
  return Object.values(decisions).filter(isAppliedCurationDecision).length;
}

/**
 * Fila ativa da preparação: pendingItems do preview menos os que já têm decisão aplicada.
 * Fonte de verdade em sessão = preview + decisions (memória do dialog).
 */
export function getActiveCurationPendingItems(params: {
  pendingItems: ChemicalAiCurationPendingItem[];
  decisions: Record<string, ChemicalAiCurationDecision>;
}): ChemicalAiCurationPendingItem[] {
  return params.pendingItems.filter(
    (item) => !isAppliedCurationDecision(params.decisions[item.sourceRowId]),
  );
}

/**
 * IDs marcados na UI que ainda pertencem à fila ativa (não decididos).
 * Decisões aplicadas / histórico nunca entram na seleção da rodada.
 */
export function getActiveSelectionIds(params: {
  selection: Record<string, boolean>;
  activePendingItems: ChemicalAiCurationPendingItem[];
}): string[] {
  const activeIds = new Set(
    params.activePendingItems.map((item) => item.sourceRowId),
  );
  return Object.entries(params.selection)
    .filter(([id, checked]) => checked && activeIds.has(id))
    .map(([id]) => id);
}

/** Remove da seleção itens que saíram da fila ativa (decisão aplicada). */
export function pruneSelectionToActiveQueue(params: {
  selection: Record<string, boolean>;
  activePendingItems: ChemicalAiCurationPendingItem[];
}): Record<string, boolean> {
  const activeIds = new Set(
    params.activePendingItems.map((item) => item.sourceRowId),
  );
  const next: Record<string, boolean> = {};
  for (const [id, checked] of Object.entries(params.selection)) {
    if (checked && activeIds.has(id)) next[id] = true;
  }
  return next;
}

export function displayOfficialName(
  officialName: string | null | undefined,
): string | null {
  const value = String(officialName ?? '').trim();
  if (!value || value === 'null' || value === 'undefined') return null;
  return value;
}

export function isBatchConfirmEligible(
  suggestion: AiCurationSuggestion,
): boolean {
  if ((suggestion.splitCandidates || []).length > 0) return false;
  if (suggestion.candidates.length !== 1) return false;
  const only = suggestion.candidates[0];
  if (!only?.cas) return false;
  if ((only.warnings || []).some((w) => ISOMER_ALERT_RE.test(w))) return false;

  const identityOk =
    suggestion.identityStatus === 'confirmed' ||
    suggestion.identityConfidence === 'HIGH' ||
    suggestion.confidence === 'HIGH';
  if (!identityOk) return false;

  const casKey = only.cas.replace(/\s+/g, '');
  const hasConfirmedCas = (only.evidences || []).some(
    (evidence) =>
      evidence.sourceType === 'EXTERNAL_SOURCE' &&
      evidence.sourceName === 'PubChem' &&
      evidence.field === 'cas' &&
      (evidence.value || '').replace(/\s+/g, '') === casKey &&
      /confirmado|CAS Common Chemistry|consenso|procedência/i.test(
        evidence.excerpt || '',
      ),
  );
  if (!hasConfirmedCas) return false;

  if (suggestion.type === 'EXISTING_RISK_MATCH') {
    if (!only.riskFactorId) return false;
    if (suggestion.catalogLinkStatus === 'class') return false;
    return true;
  }
  if (suggestion.type === 'CHEMICAL_IDENTITY') {
    return (
      suggestion.catalogLinkStatus === 'none' ||
      suggestion.catalogLinkStatus == null
    );
  }
  return false;
}

export function humanizeCurationWarning(raw: string): string {
  const text = String(raw || '').trim();
  if (!text) return text;
  if (/riskFactorId|SUBSTÂNCIA_IDENTIFICADA_SEM_FATOR|fator correspondente confirmado/i.test(text)) {
    return 'Substância identificada, mas não foi encontrado um fator correspondente confirmado no catálogo SimpleSST.';
  }
  if (/CAS_SEM_EVIDÊNCIA|CAS removido|invent/i.test(text)) {
    return 'CAS removido: não havia evidência estruturada suficiente.';
  }
  return text
    .replace(/\briskFactorId\b/gi, 'fator interno')
    .replace(/\bpreferredCas\b/gi, 'CAS confirmado')
    .replace(/\bnull\b/gi, '');
}

export function identityStatusLabel(
  status: AiCurationSuggestion['identityStatus'],
): string {
  if (status === 'confirmed') return 'Confirmada';
  if (status === 'probable') return 'Provável';
  return 'Insuficiente';
}

export function catalogLinkStatusLabel(
  status: AiCurationSuggestion['catalogLinkStatus'],
): string {
  if (status === 'exact') return 'Fator exato';
  if (status === 'class') return 'Fator mais amplo';
  if (status === 'multiple') return 'Múltiplos candidatos';
  return 'Nenhum fator correspondente';
}

export function partitionPubChemEvidences(evidences: AiCurationEvidence[]) {
  const confirmedCas: AiCurationEvidence[] = [];
  const registryNumbers: AiCurationEvidence[] = [];
  const other: AiCurationEvidence[] = [];
  for (const evidence of evidences || []) {
    if (evidence.sourceName !== 'PubChem') continue;
    if (evidence.field === 'cas') confirmedCas.push(evidence);
    else if (evidence.field === 'registryNumber') registryNumbers.push(evidence);
    else other.push(evidence);
  }
  return { confirmedCas, registryNumbers, other };
}

export function pendingStatusBucket(
  item: ChemicalAiCurationPendingItem,
  suggestion?: AiCurationSuggestion | null,
): string {
  if (suggestion?.type === 'INSUFFICIENT_EVIDENCE') return 'INSUFFICIENT';
  if (suggestion?.type === 'SPLIT_COMPONENT') return 'SPLIT';
  if (suggestion?.type === 'CHEMICAL_IDENTITY') return 'IDENTITY';
  if (suggestion?.type === 'EXISTING_RISK_MATCH') return 'EXISTING';
  if (item.matchStatus === 'NO_MATCH') return 'NO_MATCH';
  if (item.matchStatus === 'INVALID_CAS') return 'INVALID_CAS';
  if (item.matchStatus === 'REVIEW_REQUIRED') return 'REVIEW_REQUIRED';
  return item.matchStatus;
}

/**
 * Filtro padrão da fila:
 * - sem sugestões → Aguardando (nunca Processados)
 * - ao receber a primeira rodada de sugestões → Processados nesta rodada
 */
export function resolveCurationQueueFilter(params: {
  filter: CurationFilter;
  suggestionsCount: number;
  justReceivedFirstSuggestions?: boolean;
}): CurationFilter {
  if (params.suggestionsCount === 0) {
    // Processados com zero sugestões esvazia a lista — forçar Aguardando.
    if (params.filter === 'PROCESSED') return 'AWAITING';
    return params.filter;
  }
  if (params.justReceivedFirstSuggestions) return 'PROCESSED';
  return params.filter;
}

export function filterCurationQueueItems(params: {
  pendingItems: ChemicalAiCurationPendingItem[];
  suggestionsById: Map<string, AiCurationSuggestion>;
  decisions: Record<string, ChemicalAiCurationDecision>;
  filter: CurationFilter;
}): ChemicalAiCurationPendingItem[] {
  const effectiveFilter = resolveCurationQueueFilter({
    filter: params.filter,
    suggestionsCount: params.suggestionsById.size,
  });

  // Fila ativa: decisões aplicadas saem da fila (exceto filtro CONFIRMED = histórico).
  const baseItems =
    effectiveFilter === 'CONFIRMED' || effectiveFilter === 'REJECTED'
      ? params.pendingItems
      : getActiveCurationPendingItems({
          pendingItems: params.pendingItems,
          decisions: params.decisions,
        });

  return baseItems.filter((item) => {
    const suggestion = params.suggestionsById.get(item.sourceRowId);
    const decision = params.decisions[item.sourceRowId];
    switch (effectiveFilter) {
      case 'PROCESSED':
        return Boolean(suggestion);
      case 'AWAITING':
        return !suggestion;
      case 'HIGH':
        return suggestion?.confidence === 'HIGH';
      case 'MEDIUM':
        return suggestion?.confidence === 'MEDIUM';
      case 'LOW':
        return suggestion?.confidence === 'LOW';
      case 'INSUFFICIENT':
        return suggestion?.type === 'INSUFFICIENT_EVIDENCE';
      case 'EXISTING':
        return suggestion?.type === 'EXISTING_RISK_MATCH';
      case 'IDENTITY':
        return suggestion?.type === 'CHEMICAL_IDENTITY';
      case 'SPLIT':
        return suggestion?.type === 'SPLIT_COMPONENT';
      case 'NO_MATCH':
        return item.matchStatus === 'NO_MATCH';
      case 'REVIEW_REQUIRED':
        return item.matchStatus === 'REVIEW_REQUIRED';
      case 'INVALID_CAS':
        return item.matchStatus === 'INVALID_CAS';
      case 'REJECTED':
        return decision?.action === 'REJECT';
      case 'CONFIRMED':
        return isAppliedCurationDecision(decision);
      case 'PENDING':
        return Boolean(suggestion) && !decision;
      case 'ALL':
      default:
        return true;
    }
  });
}

export function paginateCurationQueueItems<T>(params: {
  items: T[];
  page: number;
  pageSize?: number;
}): { pageItems: T[]; pageCount: number; safePage: number } {
  const pageSize = params.pageSize ?? CURATION_QUEUE_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(params.items.length / pageSize));
  const safePage = Math.min(Math.max(1, params.page), pageCount);
  const pageItems = params.items.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  return { pageItems, pageCount, safePage };
}

export function initialCurationFilter(): CurationFilter {
  return 'AWAITING';
}

/** Progresso de sublotes da curadoria (cliente). */
export type ChemicalAiCurationProgress = {
  total: number;
  done: number;
  currentChunk: number;
  chunkTotal: number;
  cancelled: boolean;
  startedAt: number;
};

/** Tempo decorrido legível (mm:ss ou h:mm:ss). */
export function formatCurationElapsedMs(elapsedMs: number): string {
  const totalSec = Math.max(0, Math.floor(elapsedMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Texto de processamento visível.
 * Progresso numérico = sublotes reais (não inventa %).
 */
export function formatCurationProcessingLabel(params: {
  progress: ChemicalAiCurationProgress;
  elapsedMs: number;
}): string {
  const { progress, elapsedMs } = params;
  const elapsed = formatCurationElapsedMs(elapsedMs);
  if (progress.chunkTotal > 1) {
    return `Processando ${progress.total} itens — lote ${progress.currentChunk}/${progress.chunkTotal} (${progress.done}/${progress.total}) · ${elapsed} — não feche esta janela`;
  }
  return `Processando ${progress.total} itens · ${elapsed} — não feche esta janela`;
}

const EXPORT_EVIDENCE_FIELDS = new Set([
  'cas',
  'cid',
  'officialName',
  'name',
  'chemicalQueryText',
  'synonyms',
  'molecularFormula',
]);

/** Evidências enxutas para decisão/export (evita estourar multipart 1MB). */
export function slimEvidencesForExport(
  evidences?: AiCurationEvidence[] | null,
): AiCurationEvidence[] {
  if (!evidences?.length) return [];
  return evidences
    .filter(
      (evidence) =>
        evidence.field !== 'registryNumber' &&
        EXPORT_EVIDENCE_FIELDS.has(evidence.field),
    )
    .slice(0, 16)
    .map((evidence) => ({
      ...evidence,
      excerpt: evidence.excerpt?.slice(0, 400) ?? null,
    }));
}

/** Payload de decisão seguro para POST multipart de export. */
export function slimDecisionForExport(
  decision: ChemicalAiCurationDecision,
): ChemicalAiCurationDecision {
  return {
    sourceRowId: decision.sourceRowId,
    action: decision.action,
    riskFactorId: decision.riskFactorId ?? null,
    officialName: decision.officialName ?? null,
    cas: decision.cas ?? null,
    split: decision.split?.map((part) => ({
      officialName: part.officialName,
      cas: part.cas ?? null,
      riskFactorId: part.riskFactorId ?? null,
    })),
    suggestionType: decision.suggestionType ?? null,
    confidence: decision.confidence ?? null,
    rationale: decision.rationale?.slice(0, 800) ?? null,
    evidences: slimEvidencesForExport(decision.evidences),
  };
}
