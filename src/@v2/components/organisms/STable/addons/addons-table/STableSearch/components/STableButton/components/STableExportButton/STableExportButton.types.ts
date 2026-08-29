import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

import { SButtonProps } from '@v2/components/atoms/SButton/SButton.types';

export type STableExportButtonProps = {
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  text?: string;
  disabled?: boolean;
  /** Opt-in visual (ex.: pílula de utilidade). Default: color=info legado. */
  tableButtonProps?: Partial<SButtonProps>;
};
