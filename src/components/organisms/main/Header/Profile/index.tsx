// import { Avatar, Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { useRef } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Text from '@mui/material/Typography';

import { useDisclosure } from '../../../../../core/hooks/useDisclosure';
import { stringToColor } from '../../../../../core/utils/strings/stringToColor';
import { NavPopper } from './components/NavPopper';
import { IProfileProps } from './types';

export function Profile({
  showProfileData = true,
}: IProfileProps): JSX.Element {
  const anchorEl = useRef<null | HTMLDivElement>(null);

  const { isOpen, toggle, close } = useDisclosure();

  const name = 'Rodrigo Anselmo';

  return (
    <Box
      style={{ alignItems: 'center', display: 'flex', cursor: 'pointer' }}
      onClick={toggle}
    >
      {showProfileData && (
        <Box mr={8} textAlign="right">
          <Text color={'text.main'} sx={{ fontSize: '0.99rem' }}>
            {name}
          </Text>
          <Text
            color={'text.main'}
            mt={-1}
            sx={{ opacity: 0.5, fontSize: '0.81rem' }}
          >
            rodrigobanselmo@gmail.com
          </Text>
        </Box>
      )}
      <Avatar
        ref={anchorEl}
        alt={name}
        src="https://github.com/rodrigobanselmo.png"
        sx={{
          backgroundColor: stringToColor(name),
          width: ['32px', '48px'],
          height: ['32px', '48px'],
        }}
      >
        {name.split(' ')[0][0]}${name.split(' ')[1][0]}
      </Avatar>

      <NavPopper isOpen={isOpen} anchorEl={anchorEl} close={close} />
    </Box>
  );
}
