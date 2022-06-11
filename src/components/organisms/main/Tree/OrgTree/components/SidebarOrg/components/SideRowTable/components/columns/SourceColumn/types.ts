import {
  IGenerateSource,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

import { IRiskDataRow } from '../../../types';

export interface SourceColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, gs: IGenerateSource) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  data?: IRiskDataRow;
  risk: IRiskFactors | null;
}
