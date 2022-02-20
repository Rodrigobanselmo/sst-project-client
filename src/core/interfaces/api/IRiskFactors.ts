import { RiskEnum } from 'project/enum/risk.enums';

export interface IRiskFactors {
  id: string;
  name: string;
  type: RiskEnum;
  system: boolean;
}
