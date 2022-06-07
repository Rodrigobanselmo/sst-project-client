import { IRiskData } from 'core/interfaces/api/IRiskData';
import {
  IGenerateSource,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskData';

export interface SourceColumnProps {
  handleSelect: (values: Partial<IUpsertRiskData>, gs: IGenerateSource) => void;
  handleRemove: (values: Partial<IUpsertRiskData>) => void;
  data?: IRiskData;
  risk: IRiskFactors | null;
}
