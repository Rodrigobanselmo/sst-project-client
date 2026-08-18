type ChemicalSurveyProductKeyMapEntry = {
  tradeName: string;
  manufacturer?: string | null;
  chemicalProductId: string;
};

export type SurveyProductKeySelection = Record<string, string>;

export function surveyRowNeedsManualResolution(row: {
  automaticResolution?: string | null;
  productResolution: string;
}): boolean {
  const automatic = row.automaticResolution || row.productResolution;
  return automatic !== 'MATCH_UNIQUE';
}

export function toSurveyProductKeyMap(
  scenarios: Array<{
    productKey: string;
    tradeName: string;
    manufacturer: string | null;
  }>,
  selections: SurveyProductKeySelection,
): ChemicalSurveyProductKeyMapEntry[] {
  const seen = new Set<string>();
  const entries: ChemicalSurveyProductKeyMapEntry[] = [];
  for (const row of scenarios) {
    if (seen.has(row.productKey)) continue;
    seen.add(row.productKey);
    const chemicalProductId = String(selections[row.productKey] || '').trim();
    if (!chemicalProductId) continue;
    entries.push({
      tradeName: row.tradeName,
      manufacturer: row.manufacturer,
      chemicalProductId,
    });
  }
  return entries;
}

export function surveyCommitEnabled(params: {
  hasPreview: boolean;
  busy: boolean;
  blockedCount: number;
}): boolean {
  return params.hasPreview && !params.busy && params.blockedCount === 0;
}
