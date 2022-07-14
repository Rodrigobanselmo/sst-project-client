import { ReactNode } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IPopperProps } from '../types';

export type ISPopperHelper = IPopperProps & {
  content: ReactNode;
  show?: boolean;
};
