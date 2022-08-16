import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface RiskToolSingleRiskRowProps {
  risk: IRiskFactors;
  riskData?: IRiskData;
  hide?: boolean;
  riskGroupId?: string;
}
