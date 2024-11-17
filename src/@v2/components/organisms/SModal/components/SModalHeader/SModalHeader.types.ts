/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react';

export interface SModalHeaderProps {
  title?: string | ReactNode;
  onClose: () => void;
  // icon?: ReactNode;
  // modalName?: string;
  // tagTitle?: string | ReactNode;
  // tag?: ITagAction;
  // subtitle?: string;
  // secondIcon?: ElementType<any>;
  // secondIconClick?: () => void;
  // onDelete?: () => void;
}
