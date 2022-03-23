import { RiskEnum } from 'project/enum/risk.enums';

export const riskFilter = [
  { label: 'fis', filter: RiskEnum.FIS, activeColor: 'risk.fis' },
  { label: 'qui', filter: RiskEnum.QUI, activeColor: 'risk.qui' },
  { label: 'bio', filter: RiskEnum.BIO, activeColor: 'risk.bio' },
  { label: 'aci', filter: RiskEnum.ACI, activeColor: 'risk.aci' },
  { label: 'erg', filter: RiskEnum.ERG, activeColor: 'risk.erg' },
];
