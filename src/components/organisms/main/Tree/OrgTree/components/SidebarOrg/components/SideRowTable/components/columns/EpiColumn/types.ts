import { IEpi } from 'core/interfaces/api/IEpi';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

export interface EpiColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, epi: IEpi) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  data?: IRiskData;
  risk?: IRiskFactors | null;
  after?: boolean;
}
