import { BoxProps } from '@mui/material';

import { IRiskDocInfo } from 'core/interfaces/api/IRiskFactors';

export interface ISCheckRiskDocInfo extends BoxProps {
  riskDocInfo?: IRiskDocInfo;
  onUnmount?: any;
  onSelectCheck: (data: Partial<IRiskDocInfo>) => void;
}
