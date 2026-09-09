import { RiskEnum } from 'project/enum/risk.enums';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export const hierarchyFilter = [
  {
    label: 'superintendência',
    filter: HierarchyEnum.DIRECTORY,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
  {
    label: 'diretoria',
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
    label: 'sub setor',
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
    label: 'cargo des.',
    filter: HierarchyEnum.SUB_OFFICE,
    activeColor: 'primary.main',
    activeTextColor: 'common.black',
    inactiveTextColor: 'common.black',
  },
];
