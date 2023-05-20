import React, { FC } from 'react';

import SPageTitle from 'components/atoms/SPageTitle';

import { STableTitleProps } from './types';

const STableTitle: FC<{ children?: any } & STableTitleProps> = ({
  ...props
}) => <SPageTitle {...props} />;

export default STableTitle;
