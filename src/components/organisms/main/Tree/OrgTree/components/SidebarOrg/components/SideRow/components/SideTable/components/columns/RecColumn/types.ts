import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

export interface RecColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  data?: IRiskData;
  risk: IRiskFactors | null;
}
