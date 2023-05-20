import { FC } from 'react';

import SText from 'components/atoms/SText';

import { SPopperArrow } from '../../../../../../../molecules/SPopperArrow';
import { NotificationTable } from '../notificationTable/notificationTable';
import { INotificationsPopperProps } from './types';

export const NotificationsPopper: FC<
  { children?: any } & INotificationsPopperProps
> = ({ anchorEl, isOpen, close, data }) => {
  return (
    <SPopperArrow
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="paper"
      sx={{
        transform: 'translate(6px, 15px)',
        width: ['90%', 600],
        px: 0,
        py: 2,
        color: 'text.main',
      }}
    >
      {!data.length && (
        <SText
          sx={{ textAlign: 'center' }}
          color="text.secondary"
          py={5}
          fontSize={14}
        >
          Você não tem nenhuma notificação.
        </SText>
      )}
      {!!data.length && <NotificationTable />}
    </SPopperArrow>
  );
};
