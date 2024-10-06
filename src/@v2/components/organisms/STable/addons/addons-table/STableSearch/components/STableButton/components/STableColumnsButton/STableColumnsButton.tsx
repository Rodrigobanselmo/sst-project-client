import { FC } from 'react';

import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import { STableButton } from '../../STableButton';
import { STableColumnsButtonProps } from './STableColumnsButton.types';

export const STableColumnsButton: FC<STableColumnsButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STableButton
      onClick={onClick}
      tooltip={text ?? 'Colunas'}
      icon={ViewWeekOutlinedIcon}
    />
  );
};
