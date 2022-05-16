/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from '@mui/material';

export type IWizardProps = BoxProps;

export interface IWizardLeadProps extends BoxProps {
  slug?: string;
  schemas: any[];
  containerRef?: React.MutableRefObject<any>;
}

export type StepProps = {
  slug?: string;
  trackingEvent?: string;
  prevStepRef?: React.MutableRefObject<number>;
};
