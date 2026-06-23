import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export const FORM_PARTICIPANT_MISSING_DIRECTORY_LABEL = 'Sem superintendência';
export const FORM_PARTICIPANT_MISSING_MANAGEMENT_LABEL = 'Sem diretoria';
export const FORM_PARTICIPANT_MISSING_SECTOR_LABEL = 'Sem setor';
export const FORM_PARTICIPANT_MISSING_SUB_SECTOR_LABEL = 'Sem subsetor';

export function getFormParticipantHierarchyLabelByType(
  row: FormParticipantsBrowseResultModel,
  type: HierarchyTypeEnum,
  missingLabel: string,
): string {
  const node = row.hierarchies.find((h) => h.type === type);
  const name = node?.name?.trim();
  if (name) return name;
  return missingLabel;
}

/** Rótulo principal para leitura gerencial: prioriza sub-setor/setor. */
export function getFormParticipantSectorLabel(
  row: FormParticipantsBrowseResultModel,
): string {
  const sub = row.hierarchies.find((h) => h.type === HierarchyTypeEnum.SUB_SECTOR);
  const sec = row.hierarchies.find((h) => h.type === HierarchyTypeEnum.SECTOR);
  if (sub?.name) return sub.name;
  if (sec?.name) return sec.name;
  const chain = row.hierarchies.map((h) => h.name).reverse().join(' / ');
  return chain || row.hierarchyName || '—';
}

export function getFormParticipantHierarchyChain(
  row: FormParticipantsBrowseResultModel,
): string {
  return row.hierarchies?.map((h) => h.name).reverse().join(' / ') || row.hierarchyName || '—';
}
