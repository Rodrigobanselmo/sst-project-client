import { StatusEnum } from 'project/enum/status.enum';

import type {
  IRiskFactors,
  RiskFactorActivities,
} from 'core/interfaces/api/IRiskFactors';
import { resolveLinkedRiskSubTypeId } from 'core/utils/risk-subtype-display.util';

export const RISK_FACTOR_DUPLICATE_CONFIRM_MESSAGE =
  'Será criado um novo fator de risco utilizando apenas os dados cadastrais do fator atual. Caracterizações, exames, protocolos, recomendações e demais vínculos não serão copiados.';

export const RISK_FACTOR_DUPLICATE_NAME_HINT =
  'Revise o nome sugerido antes de salvar. A cópia será um fator local da empresa, sem vínculos do original.';

export const buildSuggestedDuplicateRiskName = (name?: string | null): string => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'Cópia de fator de risco';
  return `Cópia de ${trimmed}`;
};

export type RiskFactorDuplicateDraft = {
  id: '';
  companyId: string;
  status: StatusEnum;
  asLocalCompanyCopy: true;
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

/**
 * Monta draft de criação a partir do fator de origem.
 * Não inclui id, system, representAll, vínculos nem metadados de sistema.
 */
export const buildRiskFactorDuplicateDraft = (params: {
  source: RiskFactorDuplicateSource;
  companyId: string;
}): RiskFactorDuplicateDraft => {
  const { source, companyId } = params;
  const subType = resolveLinkedRiskSubTypeId(source);

  return {
    id: '',
    companyId,
    status: StatusEnum.ACTIVE,
    asLocalCompanyCopy: true,
    isDuplicateDraft: true,
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
 * Garante que o POST /risk de uma cópia local não leve vínculos nem metadados.
 */
export const sanitizeRiskCreatePayloadForLocalCopy = (
  payload: Record<string, unknown>,
  options: { companyId: string },
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = { ...payload };

  for (const key of RELATION_KEYS) {
    delete sanitized[key];
  }

  delete sanitized.recMed;
  delete sanitized.generateSource;

  sanitized.companyId = options.companyId;
  sanitized.asLocalCompanyCopy = true;
  sanitized.recMed = [];
  sanitized.generateSource = [];

  return sanitized;
};
