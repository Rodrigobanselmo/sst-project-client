import { FC } from 'react';

import { useTheme } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import { SButtonProps } from 'components/atoms/SButton/types';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import SGoogleIcon from 'assets/icons/SGoogleIcon';

export const GoogleButton: FC<
  { children?: any } & SButtonProps & { text: string }
> = ({ text, ...props }) => {
  const isDark = useTheme().palette.mode === 'dark';

  return (
    <SButton
      {...props}
      variant="outlined"
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'background.border',
        boxShadow: 'none',
        maxWidth: 'fit-content',
        minWidth: 'fit-content',
        ':hover': {
          backgroundColor: isDark ? 'background.box' : 'background.lightGray',
          borderColor: 'background.border',
          boxShadow: 'none',
          filter: 'none',
        },
        ...props?.sx,
      }}
    >
      <SFlex align="center" width="100%">
        <SGoogleIcon fontSize="1.3rem" />
        <SText
          px={5}
          width="100%"
          textAlign="center"
          color="text.main"
          fontSize="0.9rem"
        >
          {text}
        </SText>
      </SFlex>
    </SButton>
  );
};
