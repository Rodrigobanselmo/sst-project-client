import { FC } from 'react';

import { SInput } from '../SInput/SInput';
import { SInputMultilineProps } from './SInput.types';

export const SInputMultiline: FC<SInputMultilineProps> = ({ ...props }) => {
  return (
    <SInput
      {...props}
      inputProps={{
        multiline: true,
        minRows: 3,
        maxRows: 6,
        ...props.inputProps,
      }}
    />
  );
};
