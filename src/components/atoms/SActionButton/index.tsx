import { CircularProgress, Icon } from '@mui/material';
import SText from 'components/atoms/SText';

import { useAccess } from 'core/hooks/useAccess';

import STooltip from '../STooltip';
import { STBox } from './styles';
import { ISActionButtonProps } from './types';

export const SActionButton = ({
  text,
  icon,
  active,
  primary,
  success,
  tooltipText,
  loading,
  disabled,
  roles,
  permissions,
  ...props
}: ISActionButtonProps) => {
  const { isValidRoles, isValidPermissions } = useAccess();

  if (!isValidRoles(roles)) return null;
  if (!isValidPermissions(permissions)) return null;

  return (
    <STooltip title={tooltipText}>
      <STBox
        active={active ? 1 : 0}
        success={success ? 1 : 0}
        primary={primary ? 1 : 0}
        width={'fit-content'}
        disabled={disabled || loading ? 1 : 0}
        {...props}
      >
        {!loading && (
          <>
            <Icon component={icon} />
            <SText fontSize={14}>{text}</SText>
          </>
        )}
        {loading && (
          <>
            <CircularProgress color="primary" size={18} />
            <SText fontSize={14}>Carregando...</SText>
          </>
        )}
      </STBox>
    </STooltip>
  );
};
