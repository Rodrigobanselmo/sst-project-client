import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export const hierarchyFilter = [
  {
    label: 'diretoria',
    filter: HierarchyEnum.DIRECTORY,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
  {
    label: 'gerência',
    filter: HierarchyEnum.MANAGEMENT,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
  {
    label: 'setor',
    filter: HierarchyEnum.SECTOR,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
  {
    label: 'subsetor',
    filter: HierarchyEnum.SUB_SECTOR,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
  {
    label: 'cargo',
    filter: HierarchyEnum.OFFICE,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
  {
    label: 'cargo desenvolvido',
    filter: HierarchyEnum.SUB_OFFICE,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
];
