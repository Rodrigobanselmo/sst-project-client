import { BoxProps } from '@mui/material';

export interface SModalContactProps extends Omit<BoxProps, 'title'> {}
export interface SModalInitContactProps {
  id: number;
  name: string;
  phone: string;
  phone_2: string;
  email: string;
  obs: string;
}