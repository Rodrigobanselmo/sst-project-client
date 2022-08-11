// import { Avatar, Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { useRef } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Text from '@mui/material/Typography';

import { useAuth } from 'core/contexts/AuthContext';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { useDisclosure } from '../../../../../core/hooks/useDisclosure';
import { NavPopper } from './components/NavPopper';
import { IProfileProps } from './types';

export function Profile({
  showProfileData = true,
}: IProfileProps): JSX.Element {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { user } = useAuth();

  const { isOpen, toggle, close } = useDisclosure();
  const { data: company } = useQueryCompany(user?.companyId);

  const name = user?.name || 'Usuário não identificado';
  const email = user?.email || '';

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
            {email}
          </Text>
        </Box>
      )}
      <Avatar
        ref={anchorEl}
        src={company?.logoUrl || undefined}
        alt={name}
        sx={{
          // backgroundColor: stringToColor(name),
          backgroundColor: 'gray.700',
          width: ['32px', '48px'],
          height: ['32px', '48px'],
          ...(company?.logoUrl && { borderRadius: '0px' }),
          '& .MuiAvatar-img': {
            backgroundColor: 'background.default',
            objectFit: 'contain',
            p: 1,
          },
        }}
      >
        {name.split(' ')[0][0]}
        {name.split(' ')[1]?.[0] || ''}
      </Avatar>

      <NavPopper isOpen={isOpen} anchorEl={anchorEl} close={close} />
    </Box>
  );
}
