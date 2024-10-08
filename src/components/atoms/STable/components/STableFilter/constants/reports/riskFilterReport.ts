import { IFilterIconProps } from '../../STableFilterIcon/types';
import { FilterFieldEnum } from '../filter.map';

export const riskFilterReport: IFilterIconProps['filters'] = {
  fields: [
    FilterFieldEnum.COMPANY,
    FilterFieldEnum.WORSKAPACE,
    FilterFieldEnum.START_DATE,
    FilterFieldEnum.EXTERNAL_SYSTEM,
  ],
  required: [
    FilterFieldEnum.COMPANY,
    FilterFieldEnum.WORSKAPACE,
    FilterFieldEnum.START_DATE,
  ],
};
