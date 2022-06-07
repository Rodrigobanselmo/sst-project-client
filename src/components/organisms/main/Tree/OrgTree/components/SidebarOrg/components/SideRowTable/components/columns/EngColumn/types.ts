import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

export interface EngColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, recMed: IRecMed) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  data?: IRiskData;
  risk: IRiskFactors | null;
}
