import { BoxProps } from '@mui/material';

import { IRiskDocInfo } from 'core/interfaces/api/IRiskFactors';

export interface ISCheckRiskDocInfo extends BoxProps {
  riskDocInfo?: {
    isAso?: boolean;
    isPGR?: boolean;
    isPCMSO?: boolean;
    isPPP?: boolean;
  };
  onUnmount?: any;
  onSelectCheck: (data: Partial<IRiskDocInfo>) => void;
}
