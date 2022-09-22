import { useEffect, useRef } from 'react';
import { RiNotificationLine } from 'react-icons/ri';

import { Badge } from '@mui/material';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';

import { useDisclosure } from 'core/hooks/useDisclosure';
import { useQueryNotifications } from 'core/services/hooks/queries/useQueryNotifications/useQueryNotifications';

import { NotificationsPopper } from '../notificationsPopper';

export function NotificationsIcon(): JSX.Element {
  const { isOpen, toggle, close } = useDisclosure();

  const { refetch, countUnread, count } = useQueryNotifications();

  const anchorEl = useRef<null | HTMLButtonElement>(null);

  const handleClick = () => {
    toggle();
    refetch();
  };

  useEffect(() => {
    if (countUnread > 0 && !isOpen) toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countUnread]);

  return (
    <>
      <IconButton ref={anchorEl} onClick={handleClick}>
        <Badge badgeContent={countUnread} color="info">
          <Icon
            component={RiNotificationLine}
            sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }}
          />
        </Badge>
      </IconButton>
      <NotificationsPopper
        isOpen={isOpen}
        anchorEl={anchorEl}
        close={close}
        data={count ? [1] : []}
      />
    </>
  );
}
