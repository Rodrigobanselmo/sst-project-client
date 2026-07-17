export type RiskFillSource = {
  id: string;
  name: string;
  cas: string | null;
};

export type IngredientRiskFillState = {
  chemicalName: string;
  cas: string;
  riskFactorId: string | null;
};

export type RiskFillResult = {
  chemicalName: string;
  cas: string;
  riskFactorId: string | null;
  casMissingOnRisk: boolean;
  needsOverwriteConfirm: boolean;
};

/** Keep in sync with API `chemical-ingredient-risk-fill.util.ts`. */
export function planRiskFactorIngredientFill(params: {
  ingredient: IngredientRiskFillState;
  risk: RiskFillSource | null;
  confirmOverwrite?: boolean;
}): RiskFillResult {
  if (!params.risk) {
    return {
      chemicalName: params.ingredient.chemicalName,
      cas: params.ingredient.cas,
      riskFactorId: null,
      casMissingOnRisk: false,
      needsOverwriteConfirm: false,
    };
  }

  const riskName = params.risk.name.trim();
  const riskCas = params.risk.cas?.trim() || '';
  const casMissingOnRisk = !riskCas;
  const currentName = params.ingredient.chemicalName.trim();
  const currentCas = params.ingredient.cas.trim();

  const nameConflict =
    Boolean(currentName) &&
    currentName.toLowerCase() !== riskName.toLowerCase();
  const casConflict =
    Boolean(currentCas) && Boolean(riskCas) && currentCas !== riskCas;
  const needsOverwriteConfirm = nameConflict || casConflict;

  if (needsOverwriteConfirm && params.confirmOverwrite !== true) {
    return {
      chemicalName: params.ingredient.chemicalName,
      cas: params.ingredient.cas,
      riskFactorId: params.ingredient.riskFactorId,
      casMissingOnRisk,
      needsOverwriteConfirm: true,
    };
  }

  let nextName = params.ingredient.chemicalName;
  let nextCas = params.ingredient.cas;

  if (!currentName || params.confirmOverwrite === true) {
    nextName = riskName;
  }

  if ((!currentCas || params.confirmOverwrite === true) && riskCas) {
    nextCas = riskCas;
  } else if (!riskCas) {
    if (!currentCas || params.confirmOverwrite === true) {
      nextCas = '';
    }
  }

  return {
    chemicalName: nextName,
    cas: nextCas,
    riskFactorId: params.risk.id,
    casMissingOnRisk,
    needsOverwriteConfirm: false,
  };
}
