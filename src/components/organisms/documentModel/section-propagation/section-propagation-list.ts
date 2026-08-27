import {
  DocumentModelClassificationEnum,
  documentModelMatchesClassificationFilters,
} from 'project/enum/document-model-classification.enum';

import {
  SectionPropagationCandidate,
  SectionPropagationUiStatus,
} from './section-propagation.types';

export type SectionPropagationListGroupId =
  | 'linked'
  | 'applicable'
  | 'already_up_to_date'
  | 'manual_review'
  | 'not_found';

export const SECTION_PROPAGATION_LIST_GROUPS: Array<{
  id: SectionPropagationListGroupId;
  title: string;
}> = [
  { id: 'linked', title: 'Vinculados e aplicáveis' },
  { id: 'applicable', title: 'Compatíveis' },
  { id: 'already_up_to_date', title: 'Já atualizados' },
  { id: 'manual_review', title: 'Revisão manual' },
  { id: 'not_found', title: 'Seção não encontrada' },
];

export function sectionPropagationGroup(
  candidate: Pick<
    SectionPropagationCandidate,
    'selectable' | 'alreadyUpToDate' | 'uiStatus' | 'linked' | 'memberValid'
  >,
): SectionPropagationListGroupId {
  if (candidate.uiStatus === 'broken' || (candidate.linked && candidate.memberValid === false)) {
    return 'manual_review';
  }
  if (candidate.linked && candidate.selectable) return 'linked';
  if (candidate.alreadyUpToDate || candidate.uiStatus === 'already_up_to_date') {
    return 'already_up_to_date';
  }
  if (candidate.selectable) return 'applicable';
  if (candidate.uiStatus === 'not_found') return 'not_found';
  return 'manual_review';
}

export function filterSectionPropagationCandidates(
  candidates: SectionPropagationCandidate[],
  active: DocumentModelClassificationEnum[],
): SectionPropagationCandidate[] {
  return candidates.filter((candidate) =>
    documentModelMatchesClassificationFilters(candidate.classifications, active),
  );
}

function compareByName(a: SectionPropagationCandidate, b: SectionPropagationCandidate) {
  return a.name.localeCompare(b.name, 'pt-BR');
}

export function groupSectionPropagationCandidates(
  candidates: SectionPropagationCandidate[],
): Array<{
  id: SectionPropagationListGroupId;
  title: string;
  count: number;
  candidates: SectionPropagationCandidate[];
}> {
  const grouped: Record<SectionPropagationListGroupId, SectionPropagationCandidate[]> = {
    linked: [],
    applicable: [],
    already_up_to_date: [],
    manual_review: [],
    not_found: [],
  };
  for (const candidate of candidates) {
    grouped[sectionPropagationGroup(candidate)].push(candidate);
  }
  return SECTION_PROPAGATION_LIST_GROUPS.map((group) => {
    const rows = [...grouped[group.id]].sort(compareByName);
    return { ...group, count: rows.length, candidates: rows };
  });
}

export function sectionPropagationStatusColor(
  uiStatus: SectionPropagationUiStatus,
): string {
  if (uiStatus === 'compatible' || uiStatus === 'old_version_compatible') {
    return 'success.main';
  }
  if (uiStatus === 'already_up_to_date') return 'text.secondary';
  if (uiStatus === 'not_found' || uiStatus === 'ambiguous' || uiStatus === 'broken') {
    return 'error.main';
  }
  if (
    uiStatus === 'extra_content' ||
    uiStatus === 'hierarchy' ||
    uiStatus === 'structure' ||
    uiStatus === 'page_break' ||
    uiStatus === 'unsafe'
  ) {
    return 'warning.dark';
  }
  return 'text.secondary';
}

export function sectionPropagationNameColor(group: SectionPropagationListGroupId): string {
  if (group === 'already_up_to_date') return 'text.secondary';
  if (group === 'manual_review') return 'text.secondary';
  if (group === 'not_found') return 'grey.400';
  return 'text.primary';
}
