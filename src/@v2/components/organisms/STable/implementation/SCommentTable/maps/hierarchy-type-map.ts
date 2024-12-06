import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

type CharacterizationTypeMapValue = {
  label: string;
};

export const HirarchyTypeMap: Record<
  HierarchyTypeEnum,
  CharacterizationTypeMapValue
> = {
  [HierarchyTypeEnum.DIRECTORY]: { label: 'Diretoria' },
  [HierarchyTypeEnum.MANAGEMENT]: { label: 'Gerência' },
  [HierarchyTypeEnum.SECTOR]: { label: 'Setor' },
  [HierarchyTypeEnum.SUB_SECTOR]: { label: 'Sub Setor' },
  [HierarchyTypeEnum.OFFICE]: { label: 'Cargo' },
  [HierarchyTypeEnum.SUB_OFFICE]: { label: 'Cargo Desenvolvido' },
};
