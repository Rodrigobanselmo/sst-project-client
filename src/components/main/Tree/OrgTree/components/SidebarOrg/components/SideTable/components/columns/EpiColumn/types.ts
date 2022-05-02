import { IDataAddRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface EpiColumnProps {
  handleSelect: (values: IDataAddRisk) => void;
  handleRemove: (values: IDataAddRisk) => void;
  data: IDataAddRisk;
  risk?: IRiskFactors | null;
  after?: boolean;
}
