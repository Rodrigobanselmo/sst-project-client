/**
 * Frente A.2 — tipos do preview (somente leitura) da correlação ACGIH/BEI ×
 * Fatores de Risco. Alinhados 1:1 com o payload da API (Frente A.1). Nenhum
 * campo é inventado; nenhum campo de escrita é enviado.
 */

export type AcgihRiskCorrelationFinalStatus =
  | 'MATCH_REUSED_NR7'
  | 'MATCH_CAS_EXACT'
  | 'MATCH_CAS_IN_GROUP'
  | 'MATCH_NAME'
  | 'AMBIGUOUS'
  | 'NO_MATCH'
  | 'ALREADY_LINKED'
  | 'ACEITAR_CANONICO'
  | 'ACEITAR_GRUPO'
  | 'ACEITAR_MULTIPLO_CANONICO'
  | 'OVERRIDE_TARGET_MISSING';

export type AcgihRiskCorrelationDecisionSource = 'AUTO' | 'MANUAL_OVERRIDE';

export type AcgihRiskCorrelationCardinality = 'SINGLE' | 'MULTIPLE' | 'NONE';

export type AcgihRiskCorrelationMatchMethod =
  | 'CAS_VIA_NR7_LINK'
  | 'CAS_EXACT'
  | 'CAS_IN_GROUP'
  | 'NAME_EXACT'
  | 'SYNONYM_EXACT'
  | 'ALREADY_LINKED'
  | 'MANUAL_OVERRIDE'
  | null;

export type AcgihRiskCorrelationConfidence =
  | 'HIGH'
  | 'PROBABLE'
  | 'LOW'
  | 'MANUAL'
  | null;

export interface IAcgihRiskCorrelationLink {
  riskFactorId: string;
  riskName: string;
  riskCasRaw: string | null;
  riskCasParsed: string[];
  matchMethod: AcgihRiskCorrelationMatchMethod;
  confidence: AcgihRiskCorrelationConfidence;
  isGroup: boolean;
}

export interface IAcgihRiskCorrelationItem {
  acgihBeiIndicatorId: string;
  substanceName: string;
  cas: string | null;
  matrix: string | null;
  determinant: string | null;
  officialIndicatorId: string | null;
  promoted: boolean;
  alreadyLinked: boolean;
  autoStatus: AcgihRiskCorrelationFinalStatus;
  finalStatus: AcgihRiskCorrelationFinalStatus;
  decisionSource: AcgihRiskCorrelationDecisionSource;
  cardinality: AcgihRiskCorrelationCardinality;
  links: IAcgihRiskCorrelationLink[];
  blockers: string[];
  warnings: string[];
  note: string;
}

export interface IAcgihRiskCorrelationSummary {
  total: number;
  promotedCount: number;
  notPromotedCount: number;
  alreadyLinkedCount: number;
  countsByFinalStatus: Record<string, number>;
  countsByDecisionSource: Record<string, number>;
  countsByCardinality: Record<string, number>;
  blockersCount: number;
}

export interface IAcgihRiskCorrelationParams {
  search?: string;
}

export interface IAcgihRiskCorrelationResponse {
  summary: IAcgihRiskCorrelationSummary;
  items: IAcgihRiskCorrelationItem[];
}

/**
 * Frente A.3 — apply real. Alinhado 1:1 com a API. O servidor é autoritativo
 * (reexecuta o preview); o Client envia apenas a seleção opcional, o opt-in de
 * simulação e a confirmação literal. Nenhuma correlação é enviada pelo Client.
 */
export const ACGIH_RISK_CORRELATION_APPLY_CONFIRM_TEXT = 'VINCULAR ACGIH RISCOS';

export type AcgihRiskLinkResultStatus =
  | 'created'
  | 'alreadyLinked'
  | 'failed';

export type AcgihRiskCorrelationApplyItemStatus =
  | 'created'
  | 'alreadyLinked'
  | 'skipped'
  | 'failed';

export type AcgihRiskCorrelationApplySkipReason =
  | 'NOT_PROMOTED'
  | 'HAS_BLOCKERS'
  | 'NO_LINKS'
  | 'NOT_ELIGIBLE_STATUS';

export interface IAcgihRiskCorrelationApplyParams {
  acgihBeiIndicatorIds?: string[];
  dryRun?: boolean;
  confirmText: string;
}

export interface IAcgihRiskLinkResult {
  riskFactorId: string;
  riskName: string;
  status: AcgihRiskLinkResultStatus;
  linkId?: string;
  isPrimary: boolean;
  error?: string;
}

export interface IAcgihRiskCorrelationApplyItemResult {
  acgihBeiIndicatorId: string;
  substanceName: string;
  officialIndicatorId: string | null;
  finalStatus: AcgihRiskCorrelationFinalStatus;
  cardinality: AcgihRiskCorrelationCardinality;
  status: AcgihRiskCorrelationApplyItemStatus;
  skipReason?: AcgihRiskCorrelationApplySkipReason;
  links: IAcgihRiskLinkResult[];
  error?: string;
}

export interface IAcgihRiskCorrelationApplyTotals {
  requestedItems: number;
  eligibleItems: number;
  createdLinks: number;
  alreadyLinked: number;
  skipped: number;
  failed: number;
}

export interface IAcgihRiskCorrelationApplyResponse {
  dryRun: boolean;
  totals: IAcgihRiskCorrelationApplyTotals;
  items: IAcgihRiskCorrelationApplyItemResult[];
}

/**
 * Fix — consolidação completa dos ACGIH/BEI (os 65) como indicador oficial.
 * Alinhado 1:1 com a API. O servidor reexecuta o preview de correlação e cria
 * apenas OccupationalBiologicalIndicator (não cria vínculos de risco). O Client
 * envia apenas a confirmação literal.
 */
export const ACGIH_RISK_CORRELATION_CONSOLIDATE_CONFIRM_TEXT = 'CONSOLIDAR ACGIH';

export type AcgihConsolidateItemStatus =
  | 'created'
  | 'alreadyPromoted'
  | 'skipped'
  | 'failed';

export interface IAcgihConsolidateParams {
  confirmText: string;
}

export interface IAcgihConsolidateItemResult {
  acgihBeiIndicatorId: string;
  substanceName: string;
  officialIndicatorId: string | null;
  status: AcgihConsolidateItemStatus;
  reason?: string;
}

export interface IAcgihConsolidateResponse {
  totalAcgih: number;
  alreadyPromoted: number;
  created: number;
  skipped: number;
  failed: number;
  items: IAcgihConsolidateItemResult[];
}

/**
 * Vínculo ACGIH/BEI → Exame. Alinhado 1:1 com a API. O servidor é autoritativo:
 * faz o match (reuso NR-7 / determinante / nome) e cria APENAS
 * BiologicalIndicatorToExam. O Client envia apenas a confirmação literal e o
 * opt-in de simulação (dryRun). Não cria regra da Biblioteca nem ExamToRisk.
 */
export const ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT = 'VINCULAR EXAMES ACGIH';

export type AcgihExamLinkAction =
  | 'linkCreated'
  | 'alreadyLinked'
  | 'blocked'
  | 'failed';

export type AcgihExamLinkReason =
  | 'NO_EXAM_MATCH'
  | 'AMBIGUOUS_EXAM_MATCH'
  | 'NO_OFFICIAL_INDICATOR'
  | 'MISSING_DETERMINANT'
  | 'P2002_ALREADY_LINKED';

export interface IAcgihExamLinkCandidate {
  examId: number;
  examName: string;
  confidence: string;
  reason: string;
}

export interface IAcgihExamLinkItemResult {
  indicatorId: string;
  substanceName: string;
  determinant: string;
  matrix: string;
  examId?: number;
  examName?: string;
  action: AcgihExamLinkAction;
  reason?: AcgihExamLinkReason;
  candidates?: IAcgihExamLinkCandidate[];
}

export interface IAcgihExamLinkTotals {
  indicators: number;
  eligible: number;
  linksCreated: number;
  alreadyLinked: number;
  blocked: number;
  failed: number;
}

export interface IAcgihExamLinkSyncParams {
  confirmText: string;
  dryRun?: boolean;
}

export interface IAcgihExamLinkSyncResponse {
  dryRun: boolean;
  totals: IAcgihExamLinkTotals;
  items: IAcgihExamLinkItemResult[];
}
