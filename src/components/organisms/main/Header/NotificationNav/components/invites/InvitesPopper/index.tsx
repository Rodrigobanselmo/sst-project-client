/* eslint-disable @next/next/no-img-element */
import { FC } from 'react';

import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import SMailIcon from 'assets/icons/SMailIcon';

import { useAuth } from 'core/contexts/AuthContext';
import { QueryEnum } from 'core/enums/query.enums';
import { useMutUpdateUser } from 'core/services/hooks/mutations/user/useMutUpdateUser';
import { queryClient } from 'core/services/queryClient';

import { SPopperArrow } from '../../../../../../../molecules/SPopperArrow';
import { StackStyled } from './styles';
import { IInvitesPopperProps } from './types';

export const InvitesPopper: FC<IInvitesPopperProps> = ({
  anchorEl,
  isOpen,
  close,
  data,
}) => {
  const acceptInviteMut = useMutUpdateUser({
    successMessage: 'Convite aceito',
  });
  const { refreshUser } = useAuth();
  const router = useRouter();

  const handleAcceptInvite = async (id: string) => {
    await acceptInviteMut.mutateAsync({ token: id }).catch(() => {});
    refreshUser();
    router.push('/');
    queryClient.refetchQueries([QueryEnum.INVITES_USER]);
    close();
  };

  return (
    <SPopperArrow
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="paper"
      sx={{
        transform: 'translate(6px, 15px)',
        width: '26rem',
        px: 0,
        py: 2,
        color: 'text.main',
      }}
    >
      {!data.length && (
        <SText
          sx={{ textAlign: 'center' }}
          color="text.secondary"
          py={5}
          fontSize={14}
        >
          Você não tem convites pendentes.
        </SText>
      )}
      {data.map(({ expires_date, logo, companyName, id }) => {
        const isValid = dayjs(expires_date).isValid();
        return (
          <StackStyled
            key={companyName}
            px={5}
            py={4}
            spacing={3}
            onClick={() => handleAcceptInvite(id)}
          >
            <SFlex align="center">
              {!logo && <SMailIcon sx={{ fontSize: 14 }} />}
              {logo && (
                <img
                  style={{ width: 70, marginRight: 5 }}
                  alt="logomarca"
                  src={logo}
                />
              )}
              <SText lineNumber={2} fontSize={14} flex={1}>
                {companyName}
              </SText>
              <SButton
                loading={acceptInviteMut.isLoading}
                xsmall
                variant="outlined"
                color={isValid ? 'primary' : 'error'}
              >
                {isValid ? 'aceitar' : 'expirado'}
              </SButton>
            </SFlex>
            {isValid && (
              <SText fontSize={13} flex={1}>
                Você foi convidado para fazer parte como membro na empresa{' '}
                {companyName}
              </SText>
            )}
            {!isValid && (
              <SText fontSize={13} flex={1}>
                O convite expirou. Entre em contato com a empresa caso seja
                necessário enviar outro convite.
              </SText>
            )}
          </StackStyled>
        );
      })}
    </SPopperArrow>
  );
};
