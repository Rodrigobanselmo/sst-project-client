import { FC } from 'react';

import SText from 'components/atoms/SText';

import { SPopperArrow } from '../../../../../../../molecules/SPopperArrow';
import { StackStyled } from './styles';
import { IInvitesPopperProps } from './types';

export const InvitesPopper: FC<IInvitesPopperProps> = ({
  anchorEl,
  isOpen,
  close,
  data,
}) => {
  const handleAcceptInvite = (id: string) => {
    console.log(id);
  };

  return (
    <SPopperArrow
      anchorEl={anchorEl}
      isOpen={isOpen}
      close={close}
      color="paper"
      sx={{
        transform: 'translate(6px, 15px)',
        width: '20rem',
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
      {data.map(({ expires_date, companyName, id }) => (
        <StackStyled
          key={companyName}
          px={5}
          py={2}
          direction="row"
          spacing={3}
          onClick={() => handleAcceptInvite(id)}
        >
          <SText fontSize={14}>{companyName}</SText>
        </StackStyled>
      ))}
    </SPopperArrow>
  );
};
