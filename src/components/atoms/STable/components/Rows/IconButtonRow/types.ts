import { ReactNode } from 'react';

import { SIconButtonProps } from 'components/atoms/SIconButton';

export type IIconButtonRowProps = SIconButtonProps & {
  tooltipTitle?: string;
  icon: ReactNode;
};
