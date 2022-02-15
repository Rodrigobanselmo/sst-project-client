import { ISTagSelectProps } from 'components/molecules/STagSelect/types';

import { StatusEnum } from 'core/enums/status.enum';

export interface IStatusSelectProps extends Partial<ISTagSelectProps> {
  selected: StatusEnum;
  statusOptions: StatusEnum[];
}
