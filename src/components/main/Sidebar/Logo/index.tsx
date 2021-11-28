import { Icon, Typography } from '@mui/material';
import { RiMenu3Fill } from '@react-icons/all-files/ri/RiMenu3Fill';

import { useSidebarDrawer } from '../../../../core/contexts/SidebarContext';
import { Image, StackStyled, SText } from './styles';

export function LogoNavbar(): JSX.Element {
  const { isOpen, open, close } = useSidebarDrawer();

  return (
    <StackStyled direction="row" onClick={isOpen ? close : open}>
      <Image src="/icons/brand/logo-simple.svg" alt="logo" />
      <SText ml={2} align="left" noWrap>
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
      </SText>
      <Icon
        component={RiMenu3Fill}
        sx={{
          opacity: isOpen ? '1' : '0',
          transition: 'opacity 0.5s ease',
          transitionDelay: isOpen ? '0.5s' : '0',
          alignSelf: 'center',
          fontSize: '20',
          color: 'grey.400',
        }}
      />
    </StackStyled>
  );
}
