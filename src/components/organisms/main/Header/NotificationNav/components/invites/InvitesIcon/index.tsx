import { useRef } from 'react';

import { Badge } from '@mui/material';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { RiUserAddLine } from '@react-icons/all-files/ri/RiUserAddLine';

import { QueryEnum } from 'core/enums/query.enums';
import { useDisclosure } from 'core/hooks/useDisclosure';
import { useQueryUserInvites } from 'core/services/hooks/queries/useQueryUserInvites';
import { queryClient } from 'core/services/queryClient';

import { InvitesPopper } from '../InvitesPopper';

export function InvitesIcon(): JSX.Element {
  const { data } = useQueryUserInvites();
  const { isOpen, toggle, close } = useDisclosure();
  const anchorEl = useRef<null | HTMLButtonElement>(null);

  const handleClick = () => {
    toggle();
    queryClient.refetchQueries([QueryEnum.INVITES_USER]);
  };

  return (
    <>
      <IconButton ref={anchorEl} onClick={handleClick}>
        <Badge badgeContent={data.length} color="info">
          <Icon
            component={RiUserAddLine}
            sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }}
          />
        </Badge>
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
