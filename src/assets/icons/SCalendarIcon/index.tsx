import React, { FC } from 'react';

import EventIcon from '@mui/icons-material/Event';

import { IIconMuiProps } from 'core/interfaces/IIconMuiProps';

export const SCalendarIcon: FC<IIconMuiProps> = ({ ...props }) => {
  return <EventIcon {...props} />;
};

export default EventIcon;
