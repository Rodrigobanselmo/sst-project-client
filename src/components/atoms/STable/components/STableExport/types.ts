import { ReactNode } from 'react';

import { SButtonProps } from 'components/atoms/SButton/types';

export type STableExportProps = SButtonProps & {
  text?: ReactNode;
  onExportClick?: () => void;
  onInportClick?: () => void;
};
