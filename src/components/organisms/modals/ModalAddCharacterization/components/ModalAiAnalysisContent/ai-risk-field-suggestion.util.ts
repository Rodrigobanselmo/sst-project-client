import {
  AiRiskFieldSuggestion,
  AiRiskFieldSuggestionField,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export const normalizeSuggestionText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

export const buildModularSuggestionKey = (
  riskId: string,
  field: AiRiskFieldSuggestionField,
  suggestedValue: string | number,
): string => `${riskId}:${field}:${normalizeSuggestionText(String(suggestedValue))}`;

export const getSuggestionValues = (
  suggestion: AiRiskFieldSuggestion,
): Array<string | number> => {
  if (Array.isArray(suggestion.suggestedValues)) {
    return suggestion.suggestedValues;
  }
  if (
    typeof suggestion.suggestedValues === 'number' ||
    typeof suggestion.suggestedValues === 'string'
  ) {
    return [suggestion.suggestedValues];
  }
  return [];
};

export const getFieldLabel = (field: AiRiskFieldSuggestionField): string => {
  switch (field) {
    case 'generateSource':
      return 'Fonte geradora';
    case 'existingEngineeringMeasures':
      return 'Controle existente — Engenharia';
    case 'existingAdministrativeMeasures':
      return 'Controle existente — Administrativo';
    case 'recommendedEngineeringMeasures':
      return 'Recomendação — Engenharia';
    case 'recommendedAdministrativeMeasures':
      return 'Recomendação — Administrativa';
    case 'probability':
      return 'Probabilidade';
    case 'observation':
      return 'Observação';
    default:
      return field;
  }
};

/** Chip color hint so field type is scannable before Apply. */
export const getFieldChipColor = (
  field: AiRiskFieldSuggestionField,
): 'default' | 'primary' | 'secondary' | 'warning' | 'info' | 'success' => {
  switch (field) {
    case 'generateSource':
      return 'primary';
    case 'existingEngineeringMeasures':
    case 'existingAdministrativeMeasures':
      return 'warning';
    case 'recommendedEngineeringMeasures':
    case 'recommendedAdministrativeMeasures':
      return 'success';
    case 'probability':
      return 'secondary';
    case 'observation':
    default:
      return 'default';
  }
};

export type ReviewSuggestionCategoryId =
  | 'generateSources'
  | 'existingControls'
  | 'recommendations'
  | 'probability'
  | 'observations';

export type ReviewSuggestionGroup = {
  categoryId: ReviewSuggestionCategoryId;
  title: string;
  subgroups: Array<{
    subtitle?: string;
    field: AiRiskFieldSuggestionField;
    suggestions: AiRiskFieldSuggestion[];
  }>;
};

const CATEGORY_ORDER: ReviewSuggestionCategoryId[] = [
  'generateSources',
  'existingControls',
  'recommendations',
  'probability',
  'observations',
];

const FIELD_CATEGORY: Record<
  AiRiskFieldSuggestionField,
  ReviewSuggestionCategoryId
> = {
  generateSource: 'generateSources',
  existingEngineeringMeasures: 'existingControls',
  existingAdministrativeMeasures: 'existingControls',
  recommendedEngineeringMeasures: 'recommendations',
  recommendedAdministrativeMeasures: 'recommendations',
  probability: 'probability',
  observation: 'observations',
};

const CATEGORY_TITLE: Record<ReviewSuggestionCategoryId, string> = {
  generateSources: 'Fontes geradoras',
  existingControls: 'Controles existentes',
  recommendations: 'Recomendações',
  probability: 'Probabilidade',
  observations: 'Observações',
};

const FIELD_SUBTITLE: Partial<Record<AiRiskFieldSuggestionField, string>> = {
  existingEngineeringMeasures: 'Engenharia',
  existingAdministrativeMeasures: 'Administrativo',
  recommendedEngineeringMeasures: 'Engenharia',
  recommendedAdministrativeMeasures: 'Administrativa',
};

const FIELD_ORDER: AiRiskFieldSuggestionField[] = [
  'generateSource',
  'existingEngineeringMeasures',
  'existingAdministrativeMeasures',
  'recommendedEngineeringMeasures',
  'recommendedAdministrativeMeasures',
  'probability',
  'observation',
];

/** MVP caps per risk to keep the UI actionable. */
const FIELD_VALUE_LIMITS: Partial<Record<AiRiskFieldSuggestionField, number>> = {
  generateSource: 2,
  existingEngineeringMeasures: 2,
  existingAdministrativeMeasures: 2,
  recommendedEngineeringMeasures: 3,
  recommendedAdministrativeMeasures: 3,
  probability: 1,
  observation: 2,
};

const CATEGORY_TOTAL_LIMITS: Partial<Record<ReviewSuggestionCategoryId, number>> =
  {
    generateSources: 2,
    existingControls: 2,
    recommendations: 3,
    probability: 1,
    observations: 2,
  };

const isSameAsCurrentValue = (
  suggestion: AiRiskFieldSuggestion,
  value: string | number,
): boolean => {
  if (suggestion.field === 'probability') {
    return (
      typeof suggestion.currentValues === 'number' &&
      Number(suggestion.currentValues) === Number(value)
    );
  }

  if (!Array.isArray(suggestion.currentValues)) return false;

  const normalized = normalizeSuggestionText(String(value));
  return suggestion.currentValues.some(
    (current) => normalizeSuggestionText(String(current)) === normalized,
  );
};

/**
 * Visual/structural cleanup for AI reviews:
 * - drop applied session keys
 * - drop values identical to current GSE values
 * - dedupe by riskId + field + normalized suggested value
 * - apply MVP per-field / per-category caps
 */
export const filterExistingRiskReviews = (params: {
  reviews: ExistingRiskReview[];
  appliedKeys: Set<string>;
}): ExistingRiskReview[] => {
  const result: ExistingRiskReview[] = [];

  for (const review of params.reviews) {
    const seenKeys = new Set<string>();
    const categoryCounts: Partial<Record<ReviewSuggestionCategoryId, number>> =
      {};
    const fieldCounts: Partial<Record<AiRiskFieldSuggestionField, number>> = {};
    const suggestions: AiRiskFieldSuggestion[] = [];

    for (const field of FIELD_ORDER) {
      const fieldSuggestions = (review.suggestions || []).filter(
        (item) => item.field === field,
      );

      for (const suggestion of fieldSuggestions) {
        const values = getSuggestionValues(suggestion).filter((value) => {
          const key = buildModularSuggestionKey(
            review.riskId,
            suggestion.field,
            value,
          );
          if (params.appliedKeys.has(key) || seenKeys.has(key)) return false;
          if (isSameAsCurrentValue(suggestion, value)) return false;
          seenKeys.add(key);
          return true;
        });

        if (!values.length) continue;

        const category = FIELD_CATEGORY[suggestion.field];
        const fieldLimit = FIELD_VALUE_LIMITS[suggestion.field] ?? 2;
        const categoryLimit = CATEGORY_TOTAL_LIMITS[category] ?? 2;
        const usedField = fieldCounts[suggestion.field] ?? 0;
        const usedCategory = categoryCounts[category] ?? 0;
        const remaining = Math.min(
          fieldLimit - usedField,
          categoryLimit - usedCategory,
          values.length,
        );
        if (remaining <= 0) continue;

        const limited = values.slice(0, remaining);
        fieldCounts[suggestion.field] = usedField + limited.length;
        categoryCounts[category] = usedCategory + limited.length;

        suggestions.push({
          ...suggestion,
          suggestedValues:
            suggestion.field === 'probability'
              ? Number(limited[0])
              : limited.map(String),
        });
      }
    }

    if (!suggestions.length) continue;

    result.push({
      ...review,
      suggestions,
    });
  }

  return result;
};

/** Group filtered suggestions for clean accordion rendering. */
export const groupReviewSuggestions = (
  review: ExistingRiskReview,
): ReviewSuggestionGroup[] => {
  const byField = new Map<AiRiskFieldSuggestionField, AiRiskFieldSuggestion[]>();

  for (const suggestion of review.suggestions || []) {
    const list = byField.get(suggestion.field) || [];
    list.push(suggestion);
    byField.set(suggestion.field, list);
  }

  const groups: ReviewSuggestionGroup[] = [];

  for (const categoryId of CATEGORY_ORDER) {
    const fields = FIELD_ORDER.filter(
      (field) => FIELD_CATEGORY[field] === categoryId && byField.has(field),
    );

    const subgroups: ReviewSuggestionGroup['subgroups'] = [];
    for (const field of fields) {
      const fieldSuggestions = byField.get(field) || [];
      if (!fieldSuggestions.length) continue;
      subgroups.push({
        subtitle: FIELD_SUBTITLE[field],
        field,
        suggestions: fieldSuggestions,
      });
    }

    if (!subgroups.length) continue;

    groups.push({
      categoryId,
      title: CATEGORY_TITLE[categoryId],
      subgroups,
    });
  }

  return groups;
};

export const mergeExistingRiskReviews = (params: {
  existing: ExistingRiskReview[];
  incoming: ExistingRiskReview[];
}): ExistingRiskReview[] => {
  const byRiskId = new Map<string, ExistingRiskReview>();

  for (const review of params.existing) {
    byRiskId.set(review.riskId, {
      ...review,
      suggestions: [...(review.suggestions || [])],
    });
  }

  for (const review of params.incoming) {
    const current = byRiskId.get(review.riskId);
    if (!current) {
      byRiskId.set(review.riskId, {
        ...review,
        suggestions: [...(review.suggestions || [])],
      });
      continue;
    }

    const seen = new Set(
      current.suggestions.flatMap((suggestion) =>
        getSuggestionValues(suggestion).map((value) =>
          buildModularSuggestionKey(review.riskId, suggestion.field, value),
        ),
      ),
    );

    for (const suggestion of review.suggestions || []) {
      const values = getSuggestionValues(suggestion).filter((value) => {
        const key = buildModularSuggestionKey(
          review.riskId,
          suggestion.field,
          value,
        );
        if (seen.has(key)) return false;
        if (isSameAsCurrentValue(suggestion, value)) return false;
        seen.add(key);
        return true;
      });

      if (!values.length) continue;

      current.suggestions.push({
        ...suggestion,
        suggestedValues:
          suggestion.field === 'probability'
            ? Number(values[0])
            : values.map(String),
      });
    }

    if ((review.confidence ?? 0) > (current.confidence ?? 0)) {
      current.confidence = review.confidence;
    }
    if (!current.riskFactorDataId && review.riskFactorDataId) {
      current.riskFactorDataId = review.riskFactorDataId;
    }
    if (!current.current && review.current) {
      current.current = review.current;
    }
  }

  return Array.from(byRiskId.values());
};
