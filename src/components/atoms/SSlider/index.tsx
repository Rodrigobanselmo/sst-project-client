/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Slider } from '@mui/material';

import { SSliderProps } from './types';
const iOSBoxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const SSlider = React.forwardRef<any, SSliderProps>(({ ...props }, ref) => (
  <Slider
    sx={{
      ...props.sx,
      '& .MuiSlider-thumb': {
        height: 10,
        width: 10,
        boxShadow: iOSBoxShadow,
      },
    }}
    ref={ref}
    {...props}
  />
));

export default SSlider;
