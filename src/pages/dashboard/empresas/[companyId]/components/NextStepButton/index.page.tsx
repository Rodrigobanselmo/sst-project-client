import { Icon } from '@mui/material';
import SText from 'components/atoms/SText';

import { STBox } from './styles';
import { INextStepButtonProps } from './types';

export const NextStepButton = ({
  text,
  icon,
  active,
  ...props
}: INextStepButtonProps) => {
  return (
    <STBox active={active ? 1 : 0} {...props}>
      <Icon component={icon} />
      <SText fontSize={14}>{text}</SText>
    </STBox>
  );
};
