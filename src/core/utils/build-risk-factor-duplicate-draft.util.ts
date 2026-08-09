import { StatusEnum } from 'project/enum/status.enum';

import type {
  IRiskFactors,
  RiskFactorActivities,
} from 'core/interfaces/api/IRiskFactors';
import { resolveLinkedRiskSubTypeId } from 'core/utils/risk-subtype-display.util';

export const RISK_FACTOR_DUPLICATE_CONFIRM_MESSAGE =
  'Será criado um novo fator de risco com os dados deste cadastro. Nenhum vínculo do fator original será copiado. Revise as informações antes de salvar.';

export const RISK_FACTOR_DUPLICATE_NAME_HINT =
  'Revise o nome sugerido antes de salvar. Nenhum vínculo do fator original será copiado.';

export const buildSuggestedDuplicateRiskName = (name?: string | null): string => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'Cópia de fator de risco';
  return `Cópia de ${trimmed}`;
};

type RiskFactorDraftBase = {
  id: '';
  status: StatusEnum;
  isDuplicateDraft: true;
  name: string;
  type: string;
  severity: number;
  synonymous: string[];
  subType?: string;
  risk?: string;
  symptoms?: string;
  method?: string;
  unit?: string;
  propagation?: string[] | string;
  cas?: string;
  breather?: string;
  nr15lt?: string;
  twa?: string;
  stel?: string;
  acgihCeiling?: string;
  ipvs?: string;
  nioshRel?: string;
  nioshStel?: string;
  nioshCeiling?: string;
  oshaPel?: string;
  oshaStel?: string;
  oshaCeiling?: string;
  aihaWeel?: string;
  aihaWeelStel?: string;
  aihaWeelCeiling?: string;
  pv?: string;
  pe?: string;
  carnogenicityACGIH?: string;
  carnogenicityLinach?: string;
  fraction?: string;
  tlv?: string;
  coments?: string;
  appendix?: string;
  otherAppendix?: string;
  grauInsalubridade?: IRiskFactors['grauInsalubridade'];
  isEmergency: boolean;
  activities: RiskFactorActivities[];
  esocial?: IRiskFactors['esocial'];
  isAso: boolean;
  isPGR: boolean;
  isPCMSO: boolean;
  isPPP: boolean;
  recMed: [];
  generateSource: [];
};

/** Duplicar: mesmo escopo da criação normal (+); só pré-preenche o cadastro. */
export type RiskFactorDuplicateDraft = RiskFactorDraftBase & {
  companyId?: string;
  asLocalCompanyCopy?: false;
};

/**
 * Cópia explícita para a empresa aberta (banner “Criar cópia para minha empresa”).
 * Usa `asLocalCompanyCopy` — distinto de Duplicar.
 */
export type RiskFactorLocalCompanyCopyDraft = RiskFactorDraftBase & {
  companyId: string;
  asLocalCompanyCopy: true;
};

type RiskFactorDuplicateSource = Partial<IRiskFactors> & {
  subType?: string | number | null;
  risk?: string | null;
  vmp?: string | null;
  fraction?: string | null;
  tlv?: string | null;
};

const copyString = (value?: string | null): string | undefined => {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : undefined;
};

const copyStringArray = (
  value?: string[] | string | null,
): string[] | undefined => {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items : undefined;
  }
  const asString = String(value).trim();
  return asString ? [asString] : undefined;
};

const copyActivities = (
  activities?: IRiskFactors['activities'],
): RiskFactorActivities[] => {
  if (!Array.isArray(activities) || !activities.length) {
    return [];
  }

  return activities
    .filter((activity) => Boolean(activity?.description?.trim()))
    .map((activity) => ({
      description: activity.description.trim(),
      ...(activity.activityType ? { activityType: activity.activityType } : {}),
      subActivities: (activity.subActivities || [])
        .filter((sub) => Boolean(sub?.description?.trim()))
        .map((sub) => ({ description: sub.description.trim() })),
    }));
};

const buildIntrinsicDraftFields = (
  source: RiskFactorDuplicateSource,
): Omit<RiskFactorDraftBase, 'id' | 'status' | 'isDuplicateDraft'> => {
  const subType = resolveLinkedRiskSubTypeId(source);

  return {
    name: buildSuggestedDuplicateRiskName(source.name),
    type: (source.type as string) || '',
    severity: typeof source.severity === 'number' ? source.severity : 0,
    synonymous: copyStringArray(source.synonymous) || [],
    subType: subType ?? undefined,
    risk: copyString(source.risk),
    symptoms: copyString(source.symptoms),
    method: copyString(source.method),
    unit: copyString(source.unit),
    propagation: copyStringArray(source.propagation),
    cas: copyString(source.cas),
    breather: copyString(source.breather),
    nr15lt: copyString(source.nr15lt),
    twa: copyString(source.twa),
    stel: copyString(source.stel),
    acgihCeiling: copyString(source.acgihCeiling),
    ipvs: copyString(source.ipvs),
    nioshRel: copyString(source.nioshRel),
    nioshStel: copyString(source.nioshStel),
    nioshCeiling: copyString(source.nioshCeiling),
    oshaPel: copyString(source.oshaPel),
    oshaStel: copyString(source.oshaStel),
    oshaCeiling: copyString(source.oshaCeiling),
    aihaWeel: copyString(source.aihaWeel),
    aihaWeelStel: copyString(source.aihaWeelStel),
    aihaWeelCeiling: copyString(source.aihaWeelCeiling),
    pv: copyString(source.pv),
    pe: copyString(source.pe),
    carnogenicityACGIH: copyString(source.carnogenicityACGIH),
    carnogenicityLinach: copyString(source.carnogenicityLinach),
    fraction: copyString(source.fraction),
    tlv: copyString(source.tlv),
    coments: copyString(source.coments),
    appendix: copyString(source.appendix),
    otherAppendix: copyString(source.otherAppendix),
    grauInsalubridade: source.grauInsalubridade || undefined,
    isEmergency: Boolean(source.isEmergency),
    activities: copyActivities(source.activities),
    esocial: source.esocial,
    isAso: source.isAso ?? true,
    isPGR: source.isPGR ?? true,
    isPCMSO: source.isPCMSO ?? true,
    isPPP: source.isPPP ?? true,
    recMed: [],
    generateSource: [],
  };
};

/**
 * Draft de Duplicar: campos intrínsecos pré-preenchidos.
 * Escopo (system/companyId) fica com o mesmo fluxo da criação normal (+).
 * Não inclui id, system, representAll, vínculos nem metadados de sistema.
 */
export const buildRiskFactorDuplicateDraft = (params: {
  source: RiskFactorDuplicateSource;
}): RiskFactorDuplicateDraft => {
  return {
    id: '',
    status: StatusEnum.ACTIVE,
    isDuplicateDraft: true,
    ...buildIntrinsicDraftFields(params.source),
  };
};

/**
 * Draft de “Criar cópia para minha empresa”: força cópia local do tenant aberto.
 */
export const buildRiskFactorLocalCompanyCopyDraft = (params: {
  source: RiskFactorDuplicateSource;
  companyId: string;
}): RiskFactorLocalCompanyCopyDraft => {
  return {
    id: '',
    companyId: params.companyId,
    status: StatusEnum.ACTIVE,
    asLocalCompanyCopy: true,
    isDuplicateDraft: true,
    ...buildIntrinsicDraftFields(params.source),
  };
};

const RELATION_KEYS = [
  'id',
  'system',
  'representAll',
  'created_at',
  'updated_at',
  'deleted_at',
  'search',
  'recMed',
  'generateSource',
  'examToRisk',
  'protocolToRisk',
  'riskFactorData',
  'docInfo',
  'subTypes',
  'esocial',
  'isDuplicateDraft',
] as const;

/**
 * Remove vínculos/metadados do POST /risk sem forçar escopo local.
 * Usado na Duplicação (herda criação normal).
 */
export const sanitizeRiskCreatePayloadForDuplicate = (
  payload: Record<string, unknown>,
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = { ...payload };

  for (const key of RELATION_KEYS) {
    delete sanitized[key];
  }

  delete sanitized.recMed;
  delete sanitized.generateSource;
  delete sanitized.asLocalCompanyCopy;

  sanitized.recMed = [];
  sanitized.generateSource = [];

  return sanitized;
};

/**
 * Sanitiza POST /risk de cópia local explícita (`asLocalCompanyCopy`).
 * Remove vínculos e força companyId do tenant + flag local.
 */
export const sanitizeRiskCreatePayloadForLocalCopy = (
  payload: Record<string, unknown>,
  options: { companyId: string },
): Record<string, unknown> => {
  const sanitized = sanitizeRiskCreatePayloadForDuplicate(payload);

  sanitized.companyId = options.companyId;
  sanitized.asLocalCompanyCopy = true;

  return sanitized;
};
