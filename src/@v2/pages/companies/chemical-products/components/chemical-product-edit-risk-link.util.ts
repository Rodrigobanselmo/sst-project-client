import { RiskEnum } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

import type { ChemicalRiskOption } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import type { IngredientDraft } from './chemical-composition-draft.util';
import type { ChemicalCurationCreateRiskPrefill } from './chemical-curation-create-risk.util';
import {
  isValidCasRn,
  softNormalizeCas,
} from './chemical-curation-create-risk.util';

/** Pré-vínculo local por componente — ainda não persistido no IngredientDraft. */
export type PendingRiskFactor = {
  riskFactorId: string;
  name: string;
  cas: string | null;
  system: boolean;
  companyId: string | null;
  type?: string | null;
};

export type PendingRiskFactorByIngredientKey = Record<string, PendingRiskFactor>;

export function toPendingRiskFactor(
  risk: Pick<ChemicalRiskOption, 'id' | 'name' | 'cas' | 'system' | 'companyId'> & {
    type?: string | null;
  },
): PendingRiskFactor {
  return {
    riskFactorId: risk.id,
    name: risk.name,
    cas: risk.cas ?? null,
    system: Boolean(risk.system),
    companyId: risk.companyId ?? null,
    type: risk.type ?? null,
  };
}

export function pendingToRiskOption(
  pending: PendingRiskFactor,
): ChemicalRiskOption {
  return {
    id: pending.riskFactorId,
    name: pending.name,
    cas: pending.cas,
    system: pending.system,
    companyId: pending.companyId || '',
    type: pending.type || '',
  };
}

export function setPendingRiskFactorByKey(
  current: PendingRiskFactorByIngredientKey,
  ingredientKey: string,
  pending: PendingRiskFactor | null,
): PendingRiskFactorByIngredientKey {
  if (!pending) {
    if (!(ingredientKey in current)) return current;
    const next = { ...current };
    delete next[ingredientKey];
    return next;
  }
  return {
    ...current,
    [ingredientKey]: pending,
  };
}

export function removePendingRiskFactorByKey(
  current: PendingRiskFactorByIngredientKey,
  ingredientKey: string,
): PendingRiskFactorByIngredientKey {
  return setPendingRiskFactorByKey(current, ingredientKey, null);
}

/**
 * Confirma o pré-vínculo no draft: só altera riskFactorId/riskOption.
 * Nome, CAS e concentração permanecem intactos.
 */
export function confirmPendingRiskLink(params: {
  ingredient: IngredientDraft;
  pending: PendingRiskFactor;
}): IngredientDraft {
  return {
    ...params.ingredient,
    riskFactorId: params.pending.riskFactorId,
    riskOption: pendingToRiskOption(params.pending),
  };
}

/**
 * Remove apenas o vínculo de fator — preserva identidade e concentração.
 */
export function clearIngredientRiskLink(
  ingredient: IngredientDraft,
): IngredientDraft {
  return {
    ...ingredient,
    riskFactorId: null,
    riskOption: null,
  };
}

export function canKeepWithoutRiskLink(params: {
  ingredient: IngredientDraft;
  pending?: PendingRiskFactor | null;
}): boolean {
  return Boolean(params.pending) || Boolean(params.ingredient.riskFactorId);
}

export function buildEditIngredientCreateRiskPrefill(params: {
  companyId: string;
  chemicalName: string;
  cas?: string | null;
}): ChemicalCurationCreateRiskPrefill {
  const normalizedCas = softNormalizeCas(params.cas).value;
  const cas =
    normalizedCas && isValidCasRn(normalizedCas) ? normalizedCas : undefined;

  return {
    id: '',
    companyId: params.companyId,
    type: RiskEnum.QUI,
    name: String(params.chemicalName || '').trim(),
    cas,
    synonymous: [],
    severity: 0,
    status: StatusEnum.ACTIVE,
    recMed: [],
    generateSource: [],
    hasSubmit: false,
    isEmergency: false,
  };
}

export function countPendingRiskFactors(
  pendingByKey: PendingRiskFactorByIngredientKey,
): number {
  return Object.keys(pendingByKey).length;
}
