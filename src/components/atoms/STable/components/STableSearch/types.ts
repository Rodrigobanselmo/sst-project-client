/* eslint-disable @typescript-eslint/ban-types */
import { SInputProps } from 'components/atoms/SInput/types';

export type STableSearchProps = SInputProps & {
  onAddClick?: () => void;
  onExportClick?: () => void;
};
