import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';

export const FORM_PARTICIPANTS_HIERARCHY_STRUCTURE_TYPES: HierarchyTypeEnum[] = [
  HierarchyTypeEnum.DIRECTORY,
  HierarchyTypeEnum.MANAGEMENT,
  HierarchyTypeEnum.SECTOR,
  HierarchyTypeEnum.SUB_SECTOR,
];

export const FORM_PARTICIPANTS_HIERARCHY_OFFICE_TYPES: HierarchyTypeEnum[] = [
  HierarchyTypeEnum.OFFICE,
  HierarchyTypeEnum.SUB_OFFICE,
];

type HierarchyChip = NonNullable<IFormParticipantsFilterProps['hierarchies']>[number];

export function splitParticipantHierarchyFilters(
  hierarchies: HierarchyChip[] | undefined,
): {
  structureHierarchies: HierarchyChip[];
  officeHierarchies: HierarchyChip[];
} {
  const list = hierarchies ?? [];
  const structureSet = new Set(FORM_PARTICIPANTS_HIERARCHY_STRUCTURE_TYPES);
  const officeSet = new Set(FORM_PARTICIPANTS_HIERARCHY_OFFICE_TYPES);

  return {
    structureHierarchies: list.filter(
      (h) => h.type && structureSet.has(h.type),
    ),
    officeHierarchies: list.filter((h) => h.type && officeSet.has(h.type)),
  };
}

export function mergeParticipantHierarchyFilters(
  structureHierarchies: HierarchyChip[],
  officeHierarchies: HierarchyChip[],
): HierarchyChip[] {
  const seen = new Set<string>();
  const merged: HierarchyChip[] = [];

  for (const item of [...structureHierarchies, ...officeHierarchies]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }

  return merged;
}
