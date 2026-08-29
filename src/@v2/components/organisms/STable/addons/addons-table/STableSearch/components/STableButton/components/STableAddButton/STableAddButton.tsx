import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material';

import { STableButton } from '../../STableButton';
import { STableAddButtonProps } from './STableAddButtonProps.types';
import { brandIdentityToolbarAddSx } from 'configs/theme/brand-identity-fill';

export const STableAddButton: FC<STableAddButtonProps> = ({
  onClick,
  text,
  identityFill = false,
}) => {
  const isDark = useTheme().palette.mode === 'dark';
  const labelColor = isDark ? 'primary.main' : 'text.main';
  const plusColor = isDark ? 'primary.main' : 'primary.border';

  if (identityFill) {
    return (
      <STableButton
        onClick={onClick}
        text={text ?? 'Adicionar'}
        icon={<AddIcon sx={{ fontSize: 16, color: 'grey.600' }} />}
        variant="outlined"
        color="paper"
        textProps={{ color: 'text.primary' }}
        schema={{
          backgroundColor: 'transparent',
          borderColor: 'grey.600',
          color: 'text.primary',
          iconColor: 'grey.600',
        }}
        buttonProps={{ sx: brandIdentityToolbarAddSx }}
      />
    );
  }

  return (
    <STableButton
      onClick={onClick}
      text={text ?? 'Adicionar'}
      icon={<AddIcon sx={{ fontSize: 16, color: plusColor }} />}
      color="primary"
      textProps={{ color: labelColor }}
      schema={{ iconColor: plusColor }}
    />
  );
};
