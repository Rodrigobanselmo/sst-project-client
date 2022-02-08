import { RiskEnum } from 'core/enums/risk.enums';

export interface IRiskFactors {
  id: string;
  name: string;
  type: RiskEnum;
  system: boolean;
}
