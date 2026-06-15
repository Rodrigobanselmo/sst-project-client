import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RiskEnum } from 'project/enum/risk.enums';
import { hasOccupationalLimitValue } from 'core/utils/helpers/normalizeOccupationalLimitValue';

import {
  HoMethodAgentTypeEnum,
  HoMethodEvaluationTypeEnum,
  HoMethodRiskFactorSnapshot,
  type HoMethodEvaluationConditionPayload,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  calculateNr15Vmp,
  formatVmpHelperText,
  hasAcgihCeilingMarker,
  hasNr15TetoMarker,
  parseNr15NumericLimit,
} from './ho-method-nr15-vmp.util';
import { HO_METHOD_EVALUATION_TYPE_LABELS } from '../maps/ho-method.maps';

export type InferredEvaluationOption = {
  evaluationType: HoMethodEvaluationTypeEnum;
  label: string;
  limitValue: string | null;
  limitUnit: string | null;
  helperText?: string;
  limitOrigin?: string;
};

const hasValue = (value?: string | null) => hasOccupationalLimitValue(value);

export const HO_METHOD_CHEMICAL_ONLY_MESSAGE =
  'Nesta fase, o Cadastro de Métodos de HO está habilitado apenas para agentes químicos.';

export const HO_METHOD_CHEMICAL_PHASE_INFO =
  'Nesta fase, o Cadastro de Métodos de HO contempla métodos de amostragem e análise para agentes químicos. Métodos de agentes físicos serão tratados em etapa própria.';

export function isChemicalRiskFactor(type?: RiskEnum | string | null) {
  return type === RiskEnum.QUI;
}
export function mapRiskTypeToAgentType(
  _type?: RiskEnum,
): HoMethodAgentTypeEnum {
  return HoMethodAgentTypeEnum.CHEMICAL;
}

export function inferEvaluationOptionsFromRisk(
  risk?: IRiskFactors | null,
): InferredEvaluationOption[] {
  if (!risk) return [];

  const options: InferredEvaluationOption[] = [];
  const limitUnit = risk.unit?.trim() || null;

  const nr15Numeric = parseNr15NumericLimit(risk.nr15lt);
  if (nr15Numeric != null) {
    const { vmp, fd } = calculateNr15Vmp(nr15Numeric);

    options.push({
      evaluationType: HoMethodEvaluationTypeEnum.CMPT,
      label: 'CMPT / Jornada de trabalho (NR-15)',
      limitValue: String(nr15Numeric),
      limitUnit,
      limitOrigin: 'NR-15 LT',
    });

    options.push({
      evaluationType: HoMethodEvaluationTypeEnum.VMP,
      label: 'VMP / Valor Máximo Permissível (NR-15)',
      limitValue: String(vmp),
      limitUnit,
      limitOrigin: 'NR-15 LT',
      helperText: formatVmpHelperText(nr15Numeric, limitUnit),
    });
  }

  if (hasValue(risk.nr15lt) && hasNr15TetoMarker(risk.nr15lt)) {
    options.push({
      evaluationType: HoMethodEvaluationTypeEnum.NR15_TETO,
      label: 'TETO / Ceiling (NR-15)',
      limitValue: risk.nr15lt!.trim(),
      limitUnit,
      limitOrigin: 'NR-15 LT (marcador T/Teto)',
    });
  }

  if (hasValue(risk.twa) && !hasAcgihCeilingMarker(risk.twa)) {
    options.push({
      evaluationType: HoMethodEvaluationTypeEnum.TWA,
      label: 'TWA (ACGIH)',
      limitValue: risk.twa!.trim(),
      limitUnit,
      limitOrigin: 'ACGIH TWA',
    });
  }

  if (hasValue(risk.stel) && !hasAcgihCeilingMarker(risk.stel)) {
    options.push({
      evaluationType: HoMethodEvaluationTypeEnum.STEL,
      label: 'STEL (ACGIH)',
      limitValue: risk.stel!.trim(),
      limitUnit,
      limitOrigin: 'ACGIH STEL',
    });
  }

  if (hasValue(risk.acgihCeiling)) {
    options.push({
      evaluationType: HoMethodEvaluationTypeEnum.ACGIH_CEILING,
      label: 'CEILING (ACGIH)',
      limitValue: risk.acgihCeiling!.trim(),
      limitUnit,
      limitOrigin: 'ACGIH Ceiling',
    });
  } else {
    const acgihCeilingSource = [risk.twa, risk.stel].find(
      (value) => hasValue(value) && hasAcgihCeilingMarker(value),
    );

    if (acgihCeilingSource) {
      options.push({
        evaluationType: HoMethodEvaluationTypeEnum.ACGIH_CEILING,
        label: 'CEILING (ACGIH)',
        limitValue: acgihCeilingSource!.trim(),
        limitUnit,
        limitOrigin: 'ACGIH (marcador C/Ceiling legado)',
      });
    }
  }

  return options;
}

export function buildEvaluationDisplayOptions(
  inferred: InferredEvaluationOption[],
  selected: HoMethodEvaluationConditionPayload[],
): InferredEvaluationOption[] {
  const map = new Map<string, InferredEvaluationOption>();

  inferred.forEach((option) => {
    map.set(option.evaluationType, option);
  });

  selected.forEach((condition) => {
    if (map.has(condition.evaluationType)) return;

    map.set(condition.evaluationType, {
      evaluationType: condition.evaluationType,
      label:
        HO_METHOD_EVALUATION_TYPE_LABELS[condition.evaluationType] ||
        condition.evaluationType,
      limitValue: condition.limitValue ?? null,
      limitUnit: condition.limitUnit ?? null,
      limitOrigin: 'Salvo no método',
    });
  });

  return Array.from(map.values());
}

export function buildRiskOptionLabel(risk: IRiskFactors) {
  const parts = [risk.name];
  if (risk.cas?.trim()) parts.push(`CAS ${risk.cas.trim()}`);
  if (risk.synonymous?.length) {
    parts.push(risk.synonymous.slice(0, 2).join(', '));
  }
  return parts.join(' · ');
}

export function mapRiskFactorsToHoMethodSnapshot(
  risk: IRiskFactors,
): HoMethodRiskFactorSnapshot {
  return {
    id: risk.id,
    name: risk.name,
    cas: risk.cas ?? null,
    synonymous: risk.synonymous ?? [],
    type: String(risk.type),
    unit: risk.unit ?? null,
    nr15lt: risk.nr15lt ?? null,
    twa: risk.twa ?? null,
    stel: risk.stel ?? null,
    acgihCeiling: risk.acgihCeiling ?? null,
    ipvs: risk.ipvs ?? null,
    nioshRel: risk.nioshRel ?? null,
    nioshStel: risk.nioshStel ?? null,
    nioshCeiling: risk.nioshCeiling ?? null,
    oshaPel: risk.oshaPel ?? null,
    oshaStel: risk.oshaStel ?? null,
    oshaCeiling: risk.oshaCeiling ?? null,
  };
}

export function mapRiskSnapshotToRiskFactors(
  snapshot: HoMethodRiskFactorSnapshot,
): IRiskFactors {
  return {
    id: snapshot.id,
    name: snapshot.name,
    cas: snapshot.cas ?? undefined,
    synonymous: snapshot.synonymous ?? [],
    type: snapshot.type as RiskEnum,
    unit: snapshot.unit ?? undefined,
    nr15lt: snapshot.nr15lt ?? undefined,
    twa: snapshot.twa ?? undefined,
    stel: snapshot.stel ?? undefined,
    acgihCeiling: snapshot.acgihCeiling ?? undefined,
    ipvs: snapshot.ipvs ?? undefined,
    nioshRel: snapshot.nioshRel ?? undefined,
    nioshStel: snapshot.nioshStel ?? undefined,
    nioshCeiling: snapshot.nioshCeiling ?? undefined,
    oshaPel: snapshot.oshaPel ?? undefined,
    oshaStel: snapshot.oshaStel ?? undefined,
    oshaCeiling: snapshot.oshaCeiling ?? undefined,
  } as IRiskFactors;
}

export function normalizeCas(value?: string | null) {
  return value?.replace(/[-\s]/g, '').toLowerCase() ?? '';
}
