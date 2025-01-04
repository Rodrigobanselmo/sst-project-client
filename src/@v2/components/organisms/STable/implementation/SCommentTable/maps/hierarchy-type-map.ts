import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';

type CharacterizationTypeMapValue = {
  label: string;
};

export const HirarchyTypeMap: Record<
  HierarchyTypeEnum,
  CharacterizationTypeMapValue
> = {
  [HierarchyTypeEnum.DIRECTORY]: {
    label: hierarchyTypeTranslation[HierarchyTypeEnum.DIRECTORY],
  },
  [HierarchyTypeEnum.MANAGEMENT]: {
    label: hierarchyTypeTranslation[HierarchyTypeEnum.MANAGEMENT],
  },
  [HierarchyTypeEnum.SECTOR]: {
    label: hierarchyTypeTranslation[HierarchyTypeEnum.SECTOR],
  },
  [HierarchyTypeEnum.SUB_SECTOR]: {
    label: hierarchyTypeTranslation[HierarchyTypeEnum.SUB_SECTOR],
  },
  [HierarchyTypeEnum.OFFICE]: {
    label: hierarchyTypeTranslation[HierarchyTypeEnum.OFFICE],
  },
  [HierarchyTypeEnum.SUB_OFFICE]: {
    label: hierarchyTypeTranslation[HierarchyTypeEnum.SUB_OFFICE],
  },
};
