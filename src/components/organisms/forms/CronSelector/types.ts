import { Dispatch, SetStateAction } from 'react';

import { BoxProps } from '@mui/material';

export type ICronSelector = BoxProps & {
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
};
