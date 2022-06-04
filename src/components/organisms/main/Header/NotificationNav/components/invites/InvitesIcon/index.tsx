import { useRef } from 'react';

import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { RiUserAddLine } from '@react-icons/all-files/ri/RiUserAddLine';

import { useDisclosure } from 'core/hooks/useDisclosure';
import { useQueryUserInvites } from 'core/services/hooks/queries/useQueryUserInvites';

import { InvitesPopper } from '../InvitesPopper';

export function InvitesIcon(): JSX.Element {
  const { data } = useQueryUserInvites();
  const { isOpen, toggle, close } = useDisclosure();
  const anchorEl = useRef<null | HTMLButtonElement>(null);

  return (
    <>
      <IconButton ref={anchorEl} onClick={toggle}>
        <Icon
          component={RiUserAddLine}
          sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }}
        />
      </IconButton>
      <InvitesPopper
        isOpen={isOpen}
        anchorEl={anchorEl}
        close={close}
        data={data}
      />
    </>
  );
}
