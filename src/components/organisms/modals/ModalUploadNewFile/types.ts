import { BoxProps } from '@mui/material';

export interface SModalUploadPhoto extends Omit<BoxProps, 'title'> {
  imageExt?: 'png' | 'jpeg';
}
