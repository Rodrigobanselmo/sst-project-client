import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

type OrderByTranslationMap = Record<AbsenteeismHierarchyTypeEnum, string>;

export const AbsenteeismHierarchyTypeTranslation: OrderByTranslationMap = {
  [AbsenteeismHierarchyTypeEnum.WORKSPACE]: 'Estabelecimento',
  [AbsenteeismHierarchyTypeEnum.DIRECTORY]: 'Superintendência',
  [AbsenteeismHierarchyTypeEnum.MANAGEMENT]: 'Diretória',
  [AbsenteeismHierarchyTypeEnum.SECTOR]: 'Setor',
  [AbsenteeismHierarchyTypeEnum.SUB_SECTOR]: 'Sub setor',
  [AbsenteeismHierarchyTypeEnum.OFFICE]: 'Cargo',
  [AbsenteeismHierarchyTypeEnum.SUB_OFFICE]: 'Sub cargo',
  [AbsenteeismHierarchyTypeEnum.HOMOGENEOUS_GROUP]: 'Grupo homogêneo',
};
