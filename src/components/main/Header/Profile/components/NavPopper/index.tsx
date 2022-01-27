import { FC } from 'react';

import { Typography } from '@mui/material';
import { useRouter } from 'next/router';

import { useAuth } from '../../../../../../core/contexts/AuthContext';
import { SPopperArrow } from '../../../../../atoms/SPopperArrow';
import { navItems } from '../../constants/navItems';
import { StackStyled } from './styles';
import { INavProfileProps } from './types';

export const NavPopper: FC<INavProfileProps> = ({
  anchorEl,
  isOpen,
  close,
}) => {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleNavAction = (action?: string, href?: string) => {
    if (action === 'signOut') {
      signOut();
    } else {
      router.push({
        pathname: href,
      });
    }
  };

  return (
    <SPopperArrow
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="paper"
      sx={{
        transform: 'translateY(15px)',
        width: '15rem',
        px: 0,
        py: 2,
        color: 'text.main',
      }}
    >
      {navItems.map(({ label, icon: Icon, action, href }) => (
        <StackStyled
          key={label}
          px={12}
          py={6}
          direction="row"
          spacing={8}
          onClick={() => handleNavAction(action, href)}
        >
          <Icon sx={{ color: 'primary.dark' }} />
          <Typography>{label}</Typography>
        </StackStyled>
      ))}
    </SPopperArrow>
  );
};
