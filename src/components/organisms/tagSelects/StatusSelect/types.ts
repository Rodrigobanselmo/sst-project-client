import { ISTagSelectProps } from 'components/molecules/STagSelect/types';
import { StatusEnum } from 'project/enum/status.enum';

import { IStatusOptions } from 'core/constants/maps/status-options.constant';

export interface IStatusSelectProps
  extends Partial<Omit<ISTagSelectProps, 'options'>> {
  expiresDate?: Date;
  selected?: StatusEnum;
  options?: IStatusOptions;
  statusOptions: StatusEnum[];
}
