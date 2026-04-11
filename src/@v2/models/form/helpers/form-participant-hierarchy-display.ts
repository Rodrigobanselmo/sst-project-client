import { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

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
