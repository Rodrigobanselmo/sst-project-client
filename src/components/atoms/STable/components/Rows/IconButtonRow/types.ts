import { ReactNode } from 'react';

import { SIconButtonProps } from 'components/atoms/SIconButton/types';

export type IIconButtonRowProps = SIconButtonProps & {
  tooltipTitle?: string;
  icon: ReactNode;
};
