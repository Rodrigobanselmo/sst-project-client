import { useRef } from 'react';
import { RiNotificationLine } from 'react-icons/ri';

import { Badge } from '@mui/material';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';

import { useDisclosure } from 'core/hooks/useDisclosure';

import { NotificationsPopper } from '../notificationsPopper';

export function NotificationsIcon(): JSX.Element {
  const { isOpen, toggle, close } = useDisclosure();
  const anchorEl = useRef<null | HTMLButtonElement>(null);

  return (
    <>
      <IconButton ref={anchorEl} onClick={toggle}>
        <Badge badgeContent={0} color="info">
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
        data={[]}
      />
    </>
  );
}
