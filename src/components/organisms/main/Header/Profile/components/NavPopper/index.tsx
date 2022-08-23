import { FC } from 'react';

import SText from 'components/atoms/SText';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { ICompany } from 'core/interfaces/api/ICompany';

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
  const { signOut, user, refreshUser } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { onOpenModal } = useModal();

  const handleNavAction = (action?: string, href?: string) => {
    switch (action) {
      case 'signOut':
        signOut();
        enqueueSnackbar('Logout realizado com sucesso', { variant: 'success' });
        break;

      case 'changeCompany':
        onOpenModal(ModalEnum.COMPANY_SELECT, {
          multiple: false,
          onSelect: async (company: ICompany) => {
            await refreshUser(company.id);
            router.push(RoutesEnum.DASHBOARD);
          },
          type: '/by-user',
        } as Partial<typeof initialCompanySelectState>);
        break;

      default:
        router.push({
          pathname: href,
        });
        break;
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
      {navItems.map(({ label, icon: Icon, action, href }) => {
        if (
          action === 'changeCompany' &&
          user?.companies &&
          user.companies?.length < 2
        )
          return null;
        return (
          <StackStyled
            key={label}
            px={5}
            py={2}
            direction="row"
            spacing={3}
            onClick={() => handleNavAction(action, href)}
          >
            <Icon sx={{ color: 'gray.600', fontSize: '17px' }} />
            <SText fontSize={14}>{label}</SText>
          </StackStyled>
        );
      })}
    </SPopperArrow>
  );
};
