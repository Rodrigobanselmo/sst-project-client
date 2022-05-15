import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { RiNotificationLine } from '@react-icons/all-files/ri/RiNotificationLine';
import { RiUserAddLine } from '@react-icons/all-files/ri/RiUserAddLine';

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
      <IconButton>
        <Icon
          component={RiNotificationLine}
          sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }}
        />
      </IconButton>
      <IconButton>
        <Icon
          component={RiUserAddLine}
          sx={{ fontSize: ['1rem', '1.125rem', '1.2rem'] }}
        />
      </IconButton>
    </Stack>
  );
}
