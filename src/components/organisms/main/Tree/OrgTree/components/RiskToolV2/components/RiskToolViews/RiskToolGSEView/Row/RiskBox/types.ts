import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface RiskToolGSEViewRowRiskBoxProps {
  hide?: boolean;
  isRepresentAll?: boolean;
  data: IRiskFactors;
  riskData?: IRiskData;
  riskGroupId: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
  /** Borda externa vem do wrapper do bloco; remove borda própria. */
  framed?: boolean;
}
