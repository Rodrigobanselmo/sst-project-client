import React, { FC, ReactNode } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { CircularProgress, Icon, IconProps } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { SIconButtonProps } from 'components/atoms/SIconButton/types';

export const SEndButton: FC<
  SIconButtonProps & {
    iconColor?: string;
    icon?: ReactNode;
    iconProps?: IconProps;
  }
> = ({
  iconColor = 'common.white',
  icon = AddIcon,
  loading,
  iconProps = {},
  ...props
}) => {
  return (
    <>
      {loading ? (
        <CircularProgress style={{ height: 15, width: 15 }} />
      ) : (
        <SIconButton
          bg="success.main"
          sx={{
            height: '1.4rem',
            width: '1.4rem',
            mr: -2,
            mt: -1,
          }}
          {...props}
        >
          {icon && (
            <Icon
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              component={icon as any}
              {...iconProps}
              sx={{
                fontSize: '1rem',
                color: iconColor,
                ...iconProps.sx,
              }}
            />
          )}
        </SIconButton>
      )}
    </>
  );
};
