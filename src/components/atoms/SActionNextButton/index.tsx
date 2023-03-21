import { CircularProgress, Icon } from '@mui/material';
import SText from 'components/atoms/SText';

import STooltip from '../STooltip';
import { STBox } from './styles';
import { ISActionButtonProps } from './types';

export const SActionNextButton = ({
  text,
  icon,
  active,
  tooltipText,
  loading,
  disabled,
  ...props
}: ISActionButtonProps) => {
  return (
    <STooltip title={tooltipText}>
      <STBox
        active={active ? 1 : 0}
        disabled={disabled || loading ? 1 : 0}
        {...props}
      >
        {!loading && (
          <>
            <Icon component={icon} />
            <SText fontSize={11}>{text}</SText>
          </>
        )}
        {loading && (
          <>
            <CircularProgress color="primary" size={18} />
            <SText fontSize={11}>Carregando...</SText>
          </>
        )}
      </STBox>
    </STooltip>
  );
};
