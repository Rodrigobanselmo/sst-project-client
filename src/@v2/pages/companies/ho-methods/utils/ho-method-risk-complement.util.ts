import { hasOccupationalLimitValue } from 'core/utils/helpers/normalizeOccupationalLimitValue';

import type {
  HoMethodImportAgentSuggestion,
  HoMethodRiskFactorSnapshot,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

export type RiskComplementFieldKey =
  | 'oshaPel'
  | 'oshaStel'
  | 'oshaCeiling'
  | 'nioshRel'
  | 'nioshStel'
  | 'nioshCeiling'
  | 'aihaWeel'
  | 'aihaWeelCeiling'
  | 'unit'
  | 'cas'
  | 'synonymous'
  | 'method'
  | 'propagation'
  | 'coments';

export type RiskComplementSuggestion = {
  key: RiskComplementFieldKey;
  label: string;
  currentValue: string | null;
  suggestedValue: string;
  status: 'fill' | 'conflict' | 'same';
  source: string;
  selectedByDefault: boolean;
};

const LIMIT_FIELD_MAP: Array<{
  key: RiskComplementFieldKey;
  label: string;
  read: (risk: HoMethodRiskFactorSnapshot) => string | null | undefined;
  readSuggestion: (agent: HoMethodImportAgentSuggestion) => string | null | undefined;
}> = [
  {
    key: 'oshaPel',
    label: 'OSHA PEL',
    read: (risk) => risk.oshaPel,
    readSuggestion: (agent) => agent.occupationalLimits?.oshaPel?.value,
  },
  {
    key: 'oshaStel',
    label: 'OSHA STEL',
    read: (risk) => risk.oshaStel,
    readSuggestion: (agent) => agent.occupationalLimits?.oshaStel?.value,
  },
  {
    key: 'oshaCeiling',
    label: 'OSHA Ceiling',
    read: (risk) => risk.oshaCeiling,
    readSuggestion: (agent) => agent.occupationalLimits?.oshaCeiling?.value,
  },
  {
    key: 'nioshRel',
    label: 'NIOSH REL',
    read: (risk) => risk.nioshRel,
    readSuggestion: (agent) => agent.occupationalLimits?.nioshRel?.value,
  },
  {
    key: 'nioshStel',
    label: 'NIOSH STEL',
    read: (risk) => risk.nioshStel,
    readSuggestion: (agent) => agent.occupationalLimits?.nioshStel?.value,
  },
  {
    key: 'nioshCeiling',
    label: 'NIOSH Ceiling',
    read: (risk) => risk.nioshCeiling,
    readSuggestion: (agent) => agent.occupationalLimits?.nioshCeiling?.value,
  },
  {
    key: 'aihaWeel',
    label: 'AIHA WEEL',
    read: (risk) => risk.aihaWeel,
    readSuggestion: (agent) => agent.occupationalLimits?.aihaWeel?.value,
  },
  {
    key: 'aihaWeelCeiling',
    label: 'AIHA WEEL Ceiling',
    read: (risk) => risk.aihaWeelCeiling,
    readSuggestion: (agent) => agent.occupationalLimits?.aihaWeelCeiling?.value,
  },
];

const normalizeCompareValue = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';

const normalizeTechnicalCompareValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/³/g, '3')
    .replace(/m³/g, 'm3')
    .replace(/\s+/g, ' ');

function technicalNotesCoveredByComments(
  notes: string[],
  comments?: string | null,
): boolean {
  if (!comments?.trim()) return false;

  const normalizedComments = normalizeTechnicalCompareValue(comments);
  return notes.every((note) =>
    normalizedComments.includes(normalizeTechnicalCompareValue(note)),
  );
}

const inferSuggestedUnit = (agent: HoMethodImportAgentSuggestion) => {
  const limits = [
    agent.occupationalLimits?.oshaPel?.value,
    agent.occupationalLimits?.nioshRel?.value,
    agent.occupationalLimits?.nioshStel?.value,
  ].filter(Boolean);

  if (limits.some((value) => /\bppm\b/i.test(value ?? ''))) return 'ppm';
  if (limits.some((value) => /mg\/m3/i.test(value ?? ''))) return 'mg/m3';
  return null;
};

export function buildRiskComplementSuggestions(params: {
  agent: HoMethodImportAgentSuggestion;
  methodCode?: string;
  methodInstitution?: string;
}): RiskComplementSuggestion[] {
  const { agent, methodCode, methodInstitution } = params;
  const risk = agent.matchedRiskFactor;

  if (!risk || agent.matchConfidence !== 'high') return [];

  const source = [
    methodInstitution ?? 'NIOSH',
    methodCode ? `método ${methodCode}` : null,
    'importação PDF',
  ]
    .filter(Boolean)
    .join(' / ');

  const suggestions: RiskComplementSuggestion[] = [];

  LIMIT_FIELD_MAP.forEach((field) => {
    const suggestedValue = field.readSuggestion(agent)?.trim();
    if (!hasOccupationalLimitValue(suggestedValue)) return;

    const currentValue = field.read(risk) ?? null;
    const currentNormalized = normalizeCompareValue(currentValue);
    const suggestedNormalized = normalizeCompareValue(suggestedValue);

    let status: RiskComplementSuggestion['status'] = 'fill';
    if (currentNormalized && suggestedNormalized) {
      status =
        currentNormalized === suggestedNormalized ? 'same' : 'conflict';
    }

    if (status === 'same') return;

    suggestions.push({
      key: field.key,
      label: field.label,
      currentValue,
      suggestedValue: suggestedValue!,
      status,
      source,
      selectedByDefault: status === 'fill',
    });
  });

  const suggestedUnit = inferSuggestedUnit(agent);
  if (suggestedUnit && !risk.unit?.trim()) {
    suggestions.push({
      key: 'unit',
      label: 'Unidade',
      currentValue: risk.unit,
      suggestedValue: suggestedUnit,
      status: 'fill',
      source,
      selectedByDefault: true,
    });
  }

  if (agent.cas && !risk.cas?.trim()) {
    suggestions.push({
      key: 'cas',
      label: 'CAS',
      currentValue: risk.cas,
      suggestedValue: agent.cas,
      status: 'fill',
      source,
      selectedByDefault: true,
    });
  }

  const newSynonyms = agent.synonyms.filter(
    (synonym) =>
      synonym &&
      !risk.synonymous?.some(
        (existing) =>
          normalizeCompareValue(existing) === normalizeCompareValue(synonym),
      ),
  );

  if (newSynonyms.length) {
    const merged = [...(risk.synonymous ?? []), ...newSynonyms].join(', ');
    suggestions.push({
      key: 'synonymous',
      label: 'Sinônimos',
      currentValue: risk.synonymous?.join(', ') || null,
      suggestedValue: merged,
      status: risk.synonymous?.length ? 'conflict' : 'fill',
      source,
      selectedByDefault: !risk.synonymous?.length,
    });
  }

  if (agent.technicalNotes?.length) {
    const currentComments = risk.coments ?? null;

    if (!technicalNotesCoveredByComments(agent.technicalNotes, currentComments)) {
      const missingNotes = agent.technicalNotes.filter(
        (note) =>
          !normalizeTechnicalCompareValue(currentComments ?? '').includes(
            normalizeTechnicalCompareValue(note),
          ),
      );

      if (missingNotes.length) {
        const suggestedValue = currentComments?.trim()
          ? `${currentComments.trim()}\n${missingNotes.join('\n')}`
          : missingNotes.join('\n');

        suggestions.push({
          key: 'coments',
          label: 'Observações técnicas',
          currentValue: currentComments,
          suggestedValue,
          status: currentComments?.trim() ? 'conflict' : 'fill',
          source,
          selectedByDefault: !currentComments?.trim(),
        });
      }
    }
  }

  return suggestions;
}

export function hasRiskComplementSuggestions(
  agent: HoMethodImportAgentSuggestion,
  methodCode?: string,
  methodInstitution?: string,
) {
  return buildRiskComplementSuggestions({ agent, methodCode, methodInstitution }).length > 0;
}
