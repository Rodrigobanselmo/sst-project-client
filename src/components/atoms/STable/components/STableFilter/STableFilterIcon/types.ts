import { FilterFieldEnum } from '../constants/filter.map';
import { IUseFilterTableData } from '../hooks/useFilterTable';

export type IFilterIconProps = {
  filters: FilterFieldEnum[];
} & IUseFilterTableData;
