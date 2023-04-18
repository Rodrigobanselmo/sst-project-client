import { StatusEnum } from 'project/enum/status.enum';
import { FilterFieldEnum } from '../constants/filter.map';
import { IUseFilterTableData } from '../hooks/useFilterTable';
import { IStatusOptions } from 'core/constants/maps/status-options.constant';

export type IFilterIconProps = {
  filters:
    | FilterFieldEnum[]
    | {
        fields: FilterFieldEnum[];
        statusOptions?: StatusEnum[];
        statusSchema?: IStatusOptions;
      };
} & IUseFilterTableData;
