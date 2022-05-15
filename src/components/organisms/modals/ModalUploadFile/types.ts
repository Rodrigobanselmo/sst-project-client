/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export interface SModalUploadFile extends Omit<BoxProps, 'title'> {
  title?: string | ReactNode;
  subtitle?: string;
  loading?: boolean;
  onConfirm?: (files: File[], path: string) => void;
  accept?: string | string[];
  maxFiles?: number;
}
