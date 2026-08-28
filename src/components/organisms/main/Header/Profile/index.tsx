// import { Avatar, Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { useRef } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Text from '@mui/material/Typography';

import { useAuth } from 'core/contexts/AuthContext';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';
import { resolveHeaderLogo } from 'core/utils/company/resolve-visual-identity-logo';
import { useTheme } from '@mui/material/styles';

import { useDisclosure } from '../../../../../core/hooks/useDisclosure';
import { NavPopper } from './components/NavPopper';
import { IProfileProps } from './types';

export function Profile({
  showProfileData = true,
  compact = false,
}: IProfileProps): JSX.Element {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { user } = useAuth();
  const theme = useTheme();
  const { data: company } = useQueryCompany(user?.companyId);
  const { visualIdentity } = useFetchVisualIdentity({
    companyId: user?.companyId || '',
  });
  const logoSrc =
    resolveHeaderLogo(visualIdentity, theme.palette.mode) || company?.logoUrl;

  const { isOpen, toggle, close } = useDisclosure();
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
      {logoSrc ? (
        <Box
          ref={anchorEl}
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: compact ? 40 : [44, 56, 72],
            width: compact ? 104 : [112, 152, 200],
            maxHeight: '100%',
            backgroundColor: 'transparent',
          }}
        >
          <Box
            component="img"
            src={logoSrc}
            alt={name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'right center',
              backgroundColor: 'transparent',
              p: 0,
            }}
          />
        </Box>
      ) : (
        <Avatar
          ref={anchorEl}
          alt={name}
          sx={{
            backgroundColor: 'grey.700',
            width: compact ? '36px' : ['40px', '48px', '56px'],
            height: compact ? '36px' : ['40px', '48px', '56px'],
            flexShrink: 0,
          }}
        >
          {name.split(' ')[0][0]}
          {name.split(' ')[1]?.[0] || ''}
        </Avatar>
      )}

      <NavPopper isOpen={isOpen} anchorEl={anchorEl} close={close} />
    </Box>
  );
}
