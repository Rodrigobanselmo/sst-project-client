import React, { FC } from 'react';
import { GiStethoscope } from 'react-icons/gi';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SDoctorIcon: FC<{ children?: any } & IIconMuiProps> = ({
  ...props
}) => {
  return <GiStethoscope {...(props as any)} />;
};

export default GiStethoscope;
