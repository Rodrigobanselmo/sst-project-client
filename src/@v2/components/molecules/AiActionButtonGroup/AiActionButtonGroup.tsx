import { FC } from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { Box, Button, CircularProgress } from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import type { SButtonProps } from '@v2/components/atoms/SButton/SButton.types';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';

export type AiActionButtonGroupVariant = 'mui-outlined' | 's-button-shade' | 's-button-contained';

type AiActionButtonGroupProps = {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onExecute: () => void;
  onConfigure?: () => void;
  configureLabel?: string;
  /** Ícone de engrenagem, sem o texto do botão de configuração. */
  configureIconOnly?: boolean;
  executeIconOnly?: boolean;
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
  configureLabel = 'Configurar prompt/modelo',
  configureIconOnly = false,
  executeIconOnly = false,
  isMaster = false,
  variant = 'mui-outlined',
  size = 'small',
  sButtonProps,
}) => {
  const isDisabled = disabled || loading;
  const configureTooltip = 'Configurar prompt/modelo da análise de IA';
  const configureControl =
    isMaster && onConfigure ? (
      configureIconOnly ? (
        <SIconButton
          size="small"
          tooltip={configureTooltip}
          disabled={loading}
          onClick={onConfigure}
          iconButtonProps={{ 'aria-label': configureTooltip }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
        </SIconButton>
      ) : variant === 'mui-outlined' ? (
        <Button
          size={size}
          variant="text"
          startIcon={<SettingsOutlinedIcon />}
          onClick={onConfigure}
          disabled={loading}
        >
          {configureLabel}
        </Button>
      ) : (
        <SButton
          variant="text"
          color="primary"
          text={configureLabel}
          disabled={loading}
          onClick={onConfigure}
          icon={<SettingsOutlinedIcon sx={{ fontSize: 18 }} />}
          size="s"
        />
      )
    ) : null;

  if (executeIconOnly) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <SIconButton size="small" tooltip={label} disabled={isDisabled} onClick={onExecute}
          iconButtonProps={{ 'aria-label': label, sx: { color: 'text.primary', '&:hover': { backgroundColor: 'action.hover' } } }}>
          {loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />}
        </SIconButton>
        {configureControl}
      </Box>
    );
  }

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
          icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />}
        />
        {configureControl}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      <Button
        size={size}
        variant="outlined"
        startIcon={
          loading ? <CircularProgress size={16} /> : <AutoAwesomeOutlinedIcon />
        }
        onClick={onExecute}
        disabled={isDisabled}
        sx={sButtonProps?.buttonProps?.sx}
      >
        {label}
      </Button>
      {configureControl}
    </Box>
  );
};
