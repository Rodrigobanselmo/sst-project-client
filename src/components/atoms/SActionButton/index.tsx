import { Icon } from '@mui/material';
import SText from 'components/atoms/SText';

import { STBox } from './styles';
import { ISActionButtonProps } from './types';

export const SActionButton = ({
  text,
  icon,
  active,
  primary,
  success,
  ...props
}: ISActionButtonProps) => {
  return (
    <STBox
      active={active ? 1 : 0}
      success={success ? 1 : 0}
      primary={primary ? 1 : 0}
      width={'fit-content'}
      {...props}
    >
      <Icon component={icon} />
      <SText fontSize={14}>{text}</SText>
    </STBox>
  );
};
