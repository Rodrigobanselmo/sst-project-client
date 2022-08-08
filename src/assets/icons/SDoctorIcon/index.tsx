import React, { FC } from 'react';
import { GiStethoscope } from 'react-icons/gi';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SDoctorIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <GiStethoscope {...props} />;
};

export default GiStethoscope;
