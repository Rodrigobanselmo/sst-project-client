import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { FC } from 'react';
import { SIconButtonRowProps } from './SIconButtonRow.types';

export const SIconButtonRow: FC<SIconButtonRowProps> = ({
  disabled,
  children,
  iconButtonProps,
  ...props
}) => (
  <SIconButton
    disabled={disabled}
    iconButtonProps={{
      sx: {
        width: 36,
        height: 36,
        mx: 'auto',
        ...iconButtonProps?.sx,
      },
    }}
    {...props}
  >
    {children}
  </SIconButton>
);
