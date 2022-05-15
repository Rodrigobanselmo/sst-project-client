import { FC } from 'react';

import SText from 'components/atoms/SText';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

import { useAuth } from '../../../../../../../core/contexts/AuthContext';
import { SPopperArrow } from '../../../../../../molecules/SPopperArrow';
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
  const { enqueueSnackbar } = useSnackbar();

  const handleNavAction = (action?: string, href?: string) => {
    if (action === 'signOut') {
      signOut();
      enqueueSnackbar('Logout realizado com sucesso', { variant: 'success' });
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
          px={6}
          py={3}
          direction="row"
          spacing={5}
          onClick={() => handleNavAction(action, href)}
        >
          <Icon sx={{ color: 'primary.dark' }} />
          <SText>{label}</SText>
        </StackStyled>
      ))}
    </SPopperArrow>
  );
};
