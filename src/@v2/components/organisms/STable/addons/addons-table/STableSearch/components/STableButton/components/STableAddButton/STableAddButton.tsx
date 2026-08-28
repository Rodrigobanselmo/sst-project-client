import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material';

import { STableButton } from '../../STableButton';
import { STableAddButtonProps } from './STableAddButtonProps.types';

export const STableAddButton: FC<STableAddButtonProps> = ({
  onClick,
  text,
}) => {
  const isDark = useTheme().palette.mode === 'dark';
  const labelColor = isDark ? 'primary.main' : 'text.main';
  const plusColor = isDark ? 'primary.main' : 'primary.border';

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
