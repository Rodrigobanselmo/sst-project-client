import { RiskEnum } from 'project/enum/risk.enums';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export const hierarchyFilter = [
  {
    label: 'diretoria',
    filter: HierarchyEnum.DIRECTORY,
    activeColor: 'primary.main',
  },
  {
    label: 'gerência',
    filter: HierarchyEnum.MANAGEMENT,
    activeColor: 'primary.main',
  },
  { label: 'setor', filter: HierarchyEnum.SECTOR, activeColor: 'primary.main' },
  {
    label: 'sub setor',
    filter: HierarchyEnum.SUB_SECTOR,
    activeColor: 'primary.main',
  },
  { label: 'cargo', filter: HierarchyEnum.OFFICE, activeColor: 'primary.main' },
  {
    label: 'cargo des.',
    filter: HierarchyEnum.SUB_OFFICE,
    activeColor: 'primary.main',
  },
];
