import { useRef } from 'react';

import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { RiNotificationLine } from '@react-icons/all-files/ri/RiNotificationLine';

import { useDisclosure } from 'core/hooks/useDisclosure';

import { NotificationsPopper } from '../notificationsPopper';

export function NotificationsIcon(): JSX.Element {
  const { isOpen, toggle, close } = useDisclosure();
  const anchorEl = useRef<null | HTMLButtonElement>(null);

  return (
    <>
      <IconButton ref={anchorEl} onClick={toggle}>
        <Icon
          component={RiNotificationLine}
          sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }}
        />
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
