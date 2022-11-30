/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SText from 'components/atoms/SText';
import { STextProps } from 'components/atoms/SText/types';

export const STitleDivider = (props: STextProps) => {
  return (
    <SText
      border="1px solid"
      borderColor="grey.300"
      padding={'2px 8px'}
      color="white"
      borderRadius={1}
      fontSize={16}
      {...props}
      sx={{ backgroundColor: 'grey.500', ...props?.sx }}
    >
      {props.children}
    </SText>
  );
};
