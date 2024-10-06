import { FC } from 'react';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { STableButtonProps } from './STableButtonProps.types';

export const STableButton: FC<STableButtonProps> = ({ ...props }) => {
  return <SButton {...props} />;
};
