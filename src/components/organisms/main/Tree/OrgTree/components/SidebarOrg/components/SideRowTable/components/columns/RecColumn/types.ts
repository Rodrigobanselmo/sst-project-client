import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

import { IRiskDataRow } from '../../../types';

export interface RecColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, recMed: IRecMed) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  data?: IRiskDataRow;
  risk: IRiskFactors | null;
}
