import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface RiskToolSingleRiskRowProps {
  risk: IRiskFactors;
  riskData?: IRiskData;
  hide?: boolean;
  isRepresentAll?: boolean;
  riskGroupId?: string;
  readOnly?: boolean;
  /** When set, upserts this occurrence's owner HG — never the selected GSE. */
  originHomogeneousGroupId?: string;
  planWorkspaceIdOverride?: string;
}
