import { ISTagSelectProps } from 'components/molecules/STagSelect/types';
import { StatusEnum } from 'project/enum/status.enum';

import { IStatusEmployeeStepOptions } from 'core/constants/maps/status-employee-step.map';
import {
  IStatusOption,
  IStatusOptions,
} from 'core/constants/maps/status-options.constant';
import { StatusEmployeeStepEnum } from 'project/enum/statusEmployeeStep.enum';

export interface IStatusSelectProps
  extends Partial<Omit<ISTagSelectProps, 'options'>> {
  expiresDate?: Date;
  selected?: StatusEnum | StatusEmployeeStepEnum;
  options?: Record<any, IStatusOption>;
  statusOptions: StatusEnum[];
}
