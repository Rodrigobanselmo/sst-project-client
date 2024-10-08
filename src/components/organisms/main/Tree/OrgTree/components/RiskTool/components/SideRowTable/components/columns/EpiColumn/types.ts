import { IEpi } from 'core/interfaces/api/IEpi';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { IRiskDataRow } from '../../../types';

export interface EpiColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, epi: IEpi) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  handleEdit: (epi: IEpi) => void;
  data?: IRiskDataRow;
  risk?: IRiskFactors | null;
  after?: boolean;
  onlyEpi?: boolean;
}
