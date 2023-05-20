import React, { FC } from 'react';

import SPageTitle from 'components/atoms/SPageTitle';

import { STableTitleProps } from './types';

const SGraphTitle: FC<{ children?: any } & STableTitleProps> = ({
  ...props
}) => <SPageTitle {...props} />;

export default SGraphTitle;
