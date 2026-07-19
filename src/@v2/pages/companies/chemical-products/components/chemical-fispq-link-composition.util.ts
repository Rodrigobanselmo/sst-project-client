import type {
  ChemicalConcentrationKind,
  ChemicalIngredientPayload,
  ChemicalRiskOption,
  ParsedFispqIngredient,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { softNormalizeCas } from './chemical-curation-create-risk.util';

export type FispqLinkApplyMode = 'document-only' | 'document-and-composition';

export type CompositionCompareKind =
  | 'matched'
  | 'divergent'
  | 'extracted-only'
  | 'current-only';

export type MatchedRowDecision = 'keep-current' | 'apply-extracted';
export type ExtractedOnlyDecision = 'add' | 'ignore';
export type CurrentOnlyDecision = 'keep' | 'remove';

export type CurrentCompositionIngredient = {
  id: string;
  chemicalName: string;
  cas: string | null;
  concentrationKind: ChemicalConcentrationKind;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
  riskFactorId: string | null;
  riskFactor?: ChemicalRiskOption | null;
  sortOrder: number;
};

export type CompositionCompareSide = {
  key: string;
  chemicalName: string;
  cas: string | null;
  concentrationKind: ChemicalConcentrationKind;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
  riskFactorId: string | null;
  riskFactorName: string | null;
  sortOrder: number;
};

export type CompositionCompareRow = {
  id: string;
  kind: CompositionCompareKind;
  current: CompositionCompareSide | null;
  extracted: CompositionCompareSide | null;
  /** Preservar riskFactorId ao aplicar dados da FISPQ (match seguro). */
  canPreserveRiskFactor: boolean;
  defaultDecision: MatchedRowDecision | ExtractedOnlyDecision | CurrentOnlyDecision;
};

export type CompositionRowDecision =
  | MatchedRowDecision
  | ExtractedOnlyDecision
  | CurrentOnlyDecision;

export function normalizeChemicalNameForMatch(name: string | null | undefined): string {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeCasForMatch(cas: string | null | undefined): string {
  return softNormalizeCas(cas).value;
}

export function hasUsableCas(cas: string | null | undefined): boolean {
  return Boolean(normalizeCasForMatch(cas));
}

export function hasUsableExtractedIngredients(
  ingredients: ParsedFispqIngredient[] | null | undefined,
): boolean {
  if (!ingredients?.length) return false;
  return ingredients.some(
    (item) =>
      Boolean(String(item.chemicalName || '').trim()) || hasUsableCas(item.cas),
  );
}

export function metadataDiffers(params: {
  current: string | null | undefined;
  extracted: string | null | undefined;
}): boolean {
  const a = normalizeChemicalNameForMatch(params.current);
  const b = normalizeChemicalNameForMatch(params.extracted);
  if (!a && !b) return false;
  return a !== b;
}

function concentrationSignature(item: {
  concentrationKind: ChemicalConcentrationKind;
  exactPercent: number | null | undefined;
  minPercent: number | null | undefined;
  maxPercent: number | null | undefined;
}): string {
  return [
    item.concentrationKind,
    item.exactPercent ?? '',
    item.minPercent ?? '',
    item.maxPercent ?? '',
  ].join('|');
}

function toCurrentSide(
  ingredient: CurrentCompositionIngredient,
): CompositionCompareSide {
  return {
    key: ingredient.id,
    chemicalName: ingredient.chemicalName,
    cas: ingredient.cas,
    concentrationKind: ingredient.concentrationKind,
    exactPercent: ingredient.exactPercent,
    minPercent: ingredient.minPercent,
    maxPercent: ingredient.maxPercent,
    riskFactorId: ingredient.riskFactorId,
    riskFactorName: ingredient.riskFactor?.name || null,
    sortOrder: ingredient.sortOrder,
  };
}

function toExtractedSide(
  ingredient: ParsedFispqIngredient,
  index: number,
): CompositionCompareSide {
  return {
    key: `extracted-${index}`,
    chemicalName: String(ingredient.chemicalName || '').trim(),
    cas: ingredient.cas ?? null,
    concentrationKind: ingredient.concentrationKind,
    exactPercent: ingredient.exactPercent,
    minPercent: ingredient.minPercent,
    maxPercent: ingredient.maxPercent,
    riskFactorId: ingredient.riskFactorId || null,
    riskFactorName: ingredient.riskFactor?.name || null,
    sortOrder: ingredient.sortOrder ?? index,
  };
}

function fieldsDiverge(
  current: CompositionCompareSide,
  extracted: CompositionCompareSide,
): boolean {
  const nameDiffers =
    normalizeChemicalNameForMatch(current.chemicalName) !==
    normalizeChemicalNameForMatch(extracted.chemicalName);
  const concentrationDiffers =
    concentrationSignature(current) !== concentrationSignature(extracted);
  return nameDiffers || concentrationDiffers;
}

/**
 * Emparelha composição atual × ingredientes extraídos.
 * Match: (1) CAS normalizado igual; (2) ambos sem CAS utilizável e nome normalizado igual.
 */
export function buildCompositionCompareRows(params: {
  currentIngredients: CurrentCompositionIngredient[];
  extractedIngredients: ParsedFispqIngredient[];
}): CompositionCompareRow[] {
  const currentSorted = [...params.currentIngredients].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const extracted = params.extractedIngredients.map((item, index) => ({
    item,
    index,
    side: toExtractedSide(item, index),
  }));

  const usedCurrent = new Set<string>();
  const usedExtracted = new Set<number>();
  const rows: CompositionCompareRow[] = [];

  for (const extractedEntry of extracted) {
    const extractedCas = normalizeCasForMatch(extractedEntry.side.cas);
    let match: CurrentCompositionIngredient | null = null;

    if (extractedCas) {
      match =
        currentSorted.find(
          (current) =>
            !usedCurrent.has(current.id) &&
            normalizeCasForMatch(current.cas) === extractedCas,
        ) || null;
    } else {
      const extractedName = normalizeChemicalNameForMatch(
        extractedEntry.side.chemicalName,
      );
      if (extractedName) {
        match =
          currentSorted.find((current) => {
            if (usedCurrent.has(current.id)) return false;
            if (hasUsableCas(current.cas)) return false;
            return (
              normalizeChemicalNameForMatch(current.chemicalName) ===
              extractedName
            );
          }) || null;
      }
    }

    if (!match) continue;

    usedCurrent.add(match.id);
    usedExtracted.add(extractedEntry.index);
    const currentSide = toCurrentSide(match);
    const divergent = fieldsDiverge(currentSide, extractedEntry.side);
    rows.push({
      id: `pair-${match.id}-${extractedEntry.index}`,
      kind: divergent ? 'divergent' : 'matched',
      current: currentSide,
      extracted: extractedEntry.side,
      canPreserveRiskFactor: Boolean(match.riskFactorId),
      defaultDecision: 'keep-current',
    });
  }

  for (const current of currentSorted) {
    if (usedCurrent.has(current.id)) continue;
    rows.push({
      id: `current-${current.id}`,
      kind: 'current-only',
      current: toCurrentSide(current),
      extracted: null,
      canPreserveRiskFactor: false,
      defaultDecision: 'keep',
    });
  }

  for (const extractedEntry of extracted) {
    if (usedExtracted.has(extractedEntry.index)) continue;
    rows.push({
      id: `extracted-${extractedEntry.index}`,
      kind: 'extracted-only',
      current: null,
      extracted: extractedEntry.side,
      canPreserveRiskFactor: false,
      defaultDecision: 'ignore',
    });
  }

  return rows;
}

export function buildDefaultCompositionDecisions(
  rows: CompositionCompareRow[],
): Record<string, CompositionRowDecision> {
  const decisions: Record<string, CompositionRowDecision> = {};
  for (const row of rows) {
    decisions[row.id] = row.defaultDecision;
  }
  return decisions;
}

function sideToPayload(
  side: CompositionCompareSide,
  riskFactorId: string | null,
  sortOrder: number,
): ChemicalIngredientPayload {
  return {
    chemicalName:
      side.chemicalName.trim() ||
      (side.cas ? `Componente pendente (CAS ${side.cas})` : `Componente ${sortOrder + 1}`),
    cas: side.cas,
    concentrationKind: side.concentrationKind,
    exactPercent: side.exactPercent,
    minPercent: side.minPercent,
    maxPercent: side.maxPercent,
    riskFactorId,
    sortOrder,
  };
}

/**
 * Monta o payload final da composição a partir das decisões.
 * Documento-only não deve chamar esta função (retorna [] se mode document-only).
 */
export function buildLinkedFispqCompositionPayload(params: {
  mode: FispqLinkApplyMode;
  rows: CompositionCompareRow[];
  decisions: Record<string, CompositionRowDecision>;
}): ChemicalIngredientPayload[] {
  if (params.mode === 'document-only') return [];

  const decisionFor = (row: CompositionCompareRow): CompositionRowDecision =>
    params.decisions[row.id] ?? row.defaultDecision;

  const result: ChemicalIngredientPayload[] = [];

  const orderedPairs = params.rows
    .filter(
      (row) =>
        (row.kind === 'matched' || row.kind === 'divergent') && row.current,
    )
    .sort((a, b) => (a.current!.sortOrder ?? 0) - (b.current!.sortOrder ?? 0));

  for (const row of orderedPairs) {
    const decision = decisionFor(row) as MatchedRowDecision;
    if (decision === 'keep-current' && row.current) {
      result.push(
        sideToPayload(
          row.current,
          row.current.riskFactorId,
          result.length,
        ),
      );
      continue;
    }
    if (decision === 'apply-extracted' && row.extracted) {
      const riskFactorId = row.canPreserveRiskFactor
        ? row.current?.riskFactorId || null
        : null;
      result.push(sideToPayload(row.extracted, riskFactorId, result.length));
    }
  }

  const currentOnly = params.rows
    .filter((row) => row.kind === 'current-only' && row.current)
    .sort((a, b) => (a.current!.sortOrder ?? 0) - (b.current!.sortOrder ?? 0));

  for (const row of currentOnly) {
    const decision = decisionFor(row) as CurrentOnlyDecision;
    if (decision === 'keep' && row.current) {
      result.push(
        sideToPayload(
          row.current,
          row.current.riskFactorId,
          result.length,
        ),
      );
    }
  }

  const extractedOnly = params.rows
    .filter((row) => row.kind === 'extracted-only' && row.extracted)
    .sort(
      (a, b) => (a.extracted!.sortOrder ?? 0) - (b.extracted!.sortOrder ?? 0),
    );

  for (const row of extractedOnly) {
    const decision = decisionFor(row) as ExtractedOnlyDecision;
    if (decision === 'add' && row.extracted) {
      // Novos nunca herdam fator (nem o sugerido pelo parse).
      result.push(sideToPayload(row.extracted, null, result.length));
    }
  }

  return result;
}

export function getActiveCompositionIngredients(params: {
  compositionVersions?: Array<{
    status: string;
    ingredients: CurrentCompositionIngredient[];
  }> | null;
}): CurrentCompositionIngredient[] {
  const active = (params.compositionVersions || []).find(
    (version) => version.status === 'ACTIVE',
  );
  return active?.ingredients ? [...active.ingredients] : [];
}
