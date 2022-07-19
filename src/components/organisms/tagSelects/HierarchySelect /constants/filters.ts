import { RiskEnum } from 'project/enum/risk.enums';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export const hierarchyFilter = [
  { label: 'fis', filter: HierarchyEnum.DIRECTORY, activeColor: 'risk.fis' },
  { label: 'qui', filter: RiskEnum.QUI, activeColor: 'risk.qui' },
  { label: 'bio', filter: RiskEnum.BIO, activeColor: 'risk.bio' },
  { label: 'aci', filter: RiskEnum.ACI, activeColor: 'risk.aci' },
  { label: 'erg', filter: RiskEnum.ERG, activeColor: 'risk.erg' },
];
