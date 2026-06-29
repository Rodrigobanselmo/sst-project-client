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
