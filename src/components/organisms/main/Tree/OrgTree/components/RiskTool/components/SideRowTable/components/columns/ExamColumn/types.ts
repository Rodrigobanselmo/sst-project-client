import { IExam } from 'core/interfaces/api/IExam';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { IRiskDataRow } from '../../../types';

export interface EpiColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, epi: IExam) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  handleEdit: (epi: IExam) => void;
  data?: IRiskDataRow;
  risk?: IRiskFactors | null;
  after?: boolean;
  hideStandard?: boolean;
  onlyEpi?: boolean;
}
