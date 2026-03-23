import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface IRiskDataRow extends Partial<IRiskData> {
  riskIds?: IRiskFactors[];
}
