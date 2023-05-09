import { FC } from 'react';

import { SButton } from 'components/atoms/SButton';
import { SDeleteClickProps } from './types';

export const SDeleteButton: FC<SDeleteClickProps> = ({ ...props }) => {
  return (
    <SButton
      variant={'outlined'}
      size="small"
      color="error"
      sx={{ mr: 'auto' }}
      {...props}
    >
      Deletar
    </SButton>
  );
};
