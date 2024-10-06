import { FC } from 'react';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

import { STableButton } from '../../STableButton';
import { STableFilterButtonProps } from './STableFilterButton.types';

export const STableFilterButton: FC<STableFilterButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STableButton
      onClick={onClick}
      text={text ?? 'Fitros'}
      icon={FilterAltOutlinedIcon}
    />
  );
};
