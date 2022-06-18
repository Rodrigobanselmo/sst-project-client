import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { IRiskDataRow } from '../../../types';

export interface EpiColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>) => void;
  handleRemove?: (values: Partial<IUpsertRiskData>) => void;
  handleHelp?: (dataSelect: Partial<IUpsertRiskData>) => void;
  data?: IRiskDataRow;
  risk?: IRiskFactors | null;
}
