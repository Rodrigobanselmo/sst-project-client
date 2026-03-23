import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface RiskToolGSEViewRowRiskBoxProps {
  hide?: boolean;
  isRepresentAll?: boolean;
  data: IRiskFactors;
  riskData?: IRiskData;
  riskGroupId: string;
}
