import { FC } from 'react';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Button, CircularProgress } from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import type { SButtonProps } from '@v2/components/atoms/SButton/SButton.types';

export type AiActionButtonGroupVariant = 'mui-outlined' | 's-button-shade' | 's-button-contained';

type AiActionButtonGroupProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onExecute: () => void;
  onConfigure?: () => void;
  isMaster?: boolean;
  variant?: AiActionButtonGroupVariant;
  size?: 'small' | 'medium';
  sButtonProps?: Pick<SButtonProps, 'color' | 'minWidth' | 'buttonProps' | 'tooltip'>;
};

export const AiActionButtonGroup: FC<AiActionButtonGroupProps> = ({
  label,
  loading = false,
  disabled = false,
  onExecute,
  onConfigure,
  isMaster = false,
  variant = 'mui-outlined',
  size = 'small',
  sButtonProps,
}) => {
  const isDisabled = disabled || loading;

  if (variant === 's-button-shade' || variant === 's-button-contained') {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <SButton
          variant={variant === 's-button-contained' ? 'contained' : 'shade'}
          color={sButtonProps?.color ?? 'primary'}
          text={label}
          loading={loading}
          disabled={isDisabled}
          onClick={onExecute}
          minWidth={sButtonProps?.minWidth}
          tooltip={sButtonProps?.tooltip}
          buttonProps={sButtonProps?.buttonProps}
          icon={<AutoFixHighOutlinedIcon sx={{ fontSize: 18 }} />}
        />
        {isMaster && onConfigure && (
          <SButton
            variant="text"
            color="primary"
            text="Configurar prompt/modelo"
            disabled={loading}
            onClick={onConfigure}
            icon={<SettingsOutlinedIcon sx={{ fontSize: 18 }} />}
            size="s"
          />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <Button
        size={size}
        variant="outlined"
        startIcon={
          loading ? <CircularProgress size={16} /> : <AutoFixHighOutlinedIcon />
        }
        onClick={onExecute}
        disabled={isDisabled}
        sx={sButtonProps?.buttonProps?.sx}
      >
        {label}
      </Button>
      {isMaster && onConfigure && (
        <Button
          size={size}
          variant="text"
          startIcon={<SettingsOutlinedIcon />}
          onClick={onConfigure}
          disabled={loading}
        >
          Configurar prompt/modelo
        </Button>
      )}
    </Box>
  );
};
