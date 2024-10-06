import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';

import { STableButton } from '../../STableButton';
import { STableAddButtonProps } from './STableAddButtonProps.types';

export const STableAddButton: FC<STableAddButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STableButton
      onClick={onClick}
      text={text ?? 'Adicionar'}
      icon={AddIcon}
      color="success"
    />
  );
};
