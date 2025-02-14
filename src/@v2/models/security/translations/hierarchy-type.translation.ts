import { HierarchyTypeEnum } from '../enums/hierarchy-type.enum';

type HierarchyTypeTranslationMap = Record<HierarchyTypeEnum, string>;

export const hierarchyTypeTranslation: HierarchyTypeTranslationMap = {
  [HierarchyTypeEnum.DIRECTORY]: 'Superintendência',
  [HierarchyTypeEnum.MANAGEMENT]: 'Diretoria',
  [HierarchyTypeEnum.SECTOR]: 'Setor',
  [HierarchyTypeEnum.SUB_SECTOR]: 'Sub setor',
  [HierarchyTypeEnum.OFFICE]: 'Cargo',
  [HierarchyTypeEnum.SUB_OFFICE]: 'Cargo desenvolvido',
};
