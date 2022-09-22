/* eslint-disable @typescript-eslint/no-explicit-any */
import { INotification } from 'core/interfaces/api/INotification';

import { IPopperProps } from '../../../../../../../molecules/SPopperArrow/types';

export type INotificationsPopperProps = IPopperProps & {
  data: any[];
};
