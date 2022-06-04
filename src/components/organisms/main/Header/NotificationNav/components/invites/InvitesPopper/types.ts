import { IInvites } from 'core/interfaces/api/IInvites';

import { IPopperProps } from '../../../../../../../molecules/SPopperArrow/types';

export type IInvitesPopperProps = IPopperProps & {
  data: IInvites[];
};
