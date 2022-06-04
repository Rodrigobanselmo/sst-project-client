import Stack from '@mui/material/Stack';

import { InvitesIcon } from './components/invites/InvitesIcon';
import { NotificationsIcon } from './components/notifications/notificationsIcon';

export function NotificationNav(): JSX.Element {
  return (
    <Stack
      direction="row"
      spacing={[6, 10]}
      mx={[8, 12, 16]}
      pr={[8, 12, 16]}
      py={-1}
      color="gray.500"
      sx={{
        borderRight: '1px solid',
        borderColor: 'gray.500',
      }}
    >
      <NotificationsIcon />
      <InvitesIcon />
    </Stack>
  );
}
