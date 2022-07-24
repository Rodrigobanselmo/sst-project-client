import { FC } from 'react';

import { SButton } from 'components/atoms/SButton';
import { SButtonProps } from 'components/atoms/SButton/types';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import SGoogleIcon from 'assets/icons/SGoogleIcon';

export const GoogleButton: FC<SButtonProps & { text: string }> = ({
  text,
  ...props
}) => {
  return (
    <SButton
      sx={{
        backgroundColor: 'white',
        boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
        maxWidth: 'fit-content',
        minWidth: 'fit-content',
        ':hover': {
          backgroundColor: 'white',
          boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
          filter: 'brightness(0.97)',
        },
        ...(props?.sx ? props.sx : {}),
      }}
      {...props}
    >
      <SFlex align="center" width="100%">
        <SGoogleIcon fontSize="1.3rem" />
        <SText
          px={5}
          width="100%"
          textAlign="center"
          color="common.black"
          fontSize="0.9rem"
        >
          {text}
        </SText>
      </SFlex>
    </SButton>
  );
};

// /* <SText>Entrar com Google</SText> */
