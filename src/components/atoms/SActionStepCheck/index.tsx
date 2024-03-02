import { Icon } from '@mui/material';
import SText from 'components/atoms/SText';

import STooltip from '../STooltip';
import { STBox } from './styles';
import { ISActionButtonProps } from './types';
import { Circle } from '@mui/icons-material';
import CheckIcon from 'assets/icons/SCheckIcon';
import SFlex from '../SFlex';

export const SActionStepCheck = ({
  text,
  count,
  active,
  tooltipText,
  nextStepLabel,
  loading,
  disabled,
  index,
  ...props
}: ISActionButtonProps) => {
  return (
    <STooltip title={tooltipText} placement="right">
      <STBox
        active={count ? 1 : 0}
        disabled={disabled || loading ? 1 : 0}
        {...props}
      >
        <SFlex
          align={'center'}
          justify={'center'}
          border={'1px solid'}
          borderRadius={'50%'}
          borderColor={'grey.600'}
          gap={1}
          height={12}
          width={12}
          className="check-icon"
        >
          {!!count && <Icon sx={{ fontSize: 10 }} component={CheckIcon} />}
        </SFlex>
        <SText fontSize={11}>
          {(index || 0) + 1}. {nextStepLabel || text}
        </SText>
      </STBox>
    </STooltip>
  );
};
