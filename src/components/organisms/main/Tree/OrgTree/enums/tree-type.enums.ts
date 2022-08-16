import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export enum TreeTypeEnum {
  COMPANY = 'COMPANY',
  WORKSPACE = 'WORKSPACE',
  DIRECTORY = 'DIRECTORY',
  MANAGEMENT = 'MANAGEMENT',
  SECTOR = 'SECTOR',
  SUB_SECTOR = 'SUB_SECTOR',
  OFFICE = 'OFFICE',
  SUB_OFFICE = 'SUB_OFFICE',
}

export const TreeConvertToHierarchy: Record<TreeTypeEnum, HierarchyEnum> = {
  COMPANY: HierarchyEnum.OFFICE,
  WORKSPACE: HierarchyEnum.OFFICE,
  DIRECTORY: HierarchyEnum.DIRECTORY,
  MANAGEMENT: HierarchyEnum.MANAGEMENT,
  SECTOR: HierarchyEnum.SECTOR,
  SUB_SECTOR: HierarchyEnum.SUB_SECTOR,
  OFFICE: HierarchyEnum.OFFICE,
  SUB_OFFICE: HierarchyEnum.SUB_OFFICE,
};
