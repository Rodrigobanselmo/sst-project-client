import { ReactNode } from 'react';

import { SInputProps } from '../SInput/types';

export type SInputEditProps = SInputProps & {
  onCloseAction?: () => void;
  onSave?: (value: string) => void;
};
