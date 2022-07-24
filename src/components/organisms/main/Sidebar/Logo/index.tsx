import { RiCloseFill, RiMenu3Fill } from 'react-icons/ri';

import { Icon, Typography } from '@mui/material';

import { useSidebarDrawer } from '../../../../../core/contexts/SidebarContext';
import SIconButton from '../../../../atoms/SIconButton';
import { STStack, STTypography, STLogoSimple } from './styles';

export function LogoNavbar(): JSX.Element {
  const { isOpen, open, close, setAlwaysOpen, alwaysOpen, isTablet } =
    useSidebarDrawer();

  return (
    <STStack direction="row">
      <STLogoSimple onClick={isOpen ? close : open} />
      <STTypography onClick={isOpen ? close : open} ml={2} align="left" noWrap>
        Simple
        <Typography
          color={'primary.main'}
          fontSize={24}
          fontWeight="bold"
          ml={1}
          component="span"
        >
          SST
        </Typography>
      </STTypography>
      <SIconButton
        color="info"
        onClick={() => (isTablet ? close() : setAlwaysOpen(!alwaysOpen))}
      >
        <Icon
          component={alwaysOpen ? RiCloseFill : RiMenu3Fill}
          sx={{
            opacity: isOpen ? '1' : '0',
            transition: 'opacity 0.5s ease',
            transitionDelay: isOpen ? '0.5s' : '0',
            alignSelf: 'center',
            fontSize: '20',
            color: 'grey.400',
          }}
        />
      </SIconButton>
    </STStack>
  );
}
