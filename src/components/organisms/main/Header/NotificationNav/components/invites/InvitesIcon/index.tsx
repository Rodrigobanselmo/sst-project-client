import { useEffect, useRef } from 'react';
import { RiUserAddLine } from 'react-icons/ri';

import { Badge } from '@mui/material';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/router';

import { QueryEnum } from 'core/enums/query.enums';
import { useDisclosure } from 'core/hooks/useDisclosure';
import { useQueryTokenInvite } from 'core/services/hooks/queries/useQueryTokenInvite';
import { useQueryUserInvites } from 'core/services/hooks/queries/useQueryUserInvites';
import { queryClient } from 'core/services/queryClient';

import { InvitesPopper } from '../InvitesPopper';

export function InvitesIcon(): JSX.Element {
  const { data: userInvites } = useQueryUserInvites();
  const { query } = useRouter();
  const { data: inviteToken } = useQueryTokenInvite(query.token as string);

  const { isOpen, toggle, close } = useDisclosure();
  const anchorEl = useRef<null | HTMLButtonElement>(null);

  const handleClick = () => {
    toggle();
    queryClient.refetchQueries([QueryEnum.INVITES_USER]);
  };

  const data = [...userInvites];
  if (inviteToken) data.push(inviteToken);

  useEffect(() => {
    if (data.length > 0 && !isOpen) toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInvites, inviteToken]);

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
