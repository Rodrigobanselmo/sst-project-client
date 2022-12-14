import { RiskEnum } from 'project/enum/risk.enums';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';

export const GhoFilter = [
  {
    label: 'atividades',
    filter: HomoTypeEnum.ACTIVITIES,
    activeColor: 'primary.main',
  },
  {
    label: 'ambiente',
    filter: HomoTypeEnum.ENVIRONMENT,
    activeColor: 'primary.main',
  },
  {
    label: 'equipamento',
    filter: HomoTypeEnum.EQUIPMENT,
    activeColor: 'primary.main',
  },
  {
    label: 'GSE',
    filter: HomoTypeEnum.GSE,
    activeColor: 'primary.main',
  },
  {
    label: 'posto de trabalho',
    filter: HomoTypeEnum.WORKSTATION,
    activeColor: 'primary.main',
  },
];
