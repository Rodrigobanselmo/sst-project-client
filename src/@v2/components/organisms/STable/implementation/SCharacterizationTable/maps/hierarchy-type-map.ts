import { HirarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

type CharacterizationTypeMapValue = {
  label: string;
};

export const HirarchyTypeMap: Record<
  HirarchyTypeEnum,
  CharacterizationTypeMapValue
> = {
  [HirarchyTypeEnum.DIRECTORY]: { label: 'Diretoria' },
  [HirarchyTypeEnum.MANAGEMENT]: { label: 'Gerência' },
  [HirarchyTypeEnum.SECTOR]: { label: 'Setor' },
  [HirarchyTypeEnum.SUB_SECTOR]: { label: 'Sub Setor' },
  [HirarchyTypeEnum.OFFICE]: { label: 'Cargo' },
  [HirarchyTypeEnum.SUB_OFFICE]: { label: 'Cargo Desenvolvido' },
};
