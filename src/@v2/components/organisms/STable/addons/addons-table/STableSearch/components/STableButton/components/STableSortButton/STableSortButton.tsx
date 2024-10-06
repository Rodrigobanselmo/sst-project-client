import { FC } from 'react';

import SortOutlinedIcon from '@mui/icons-material/SortOutlined';

import { STableButton } from '../../STableButton';
import { STableSortButtonProps } from './STableSortButton.types';

export const STableSortButton: FC<STableSortButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STableButton
      onClick={onClick}
      tooltip={text ?? 'Ordenação'}
      icon={SortOutlinedIcon}
    />
  );
};
