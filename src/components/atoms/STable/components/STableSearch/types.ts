import { ReactNode } from 'react';

import { BoxProps, SxProps, Theme } from '@mui/material';
import { SButtonProps } from 'components/atoms/SButton/types';
import { SInputProps } from 'components/atoms/SInput/types';

import { IFilterIconProps } from '../STableFilter/STableFilterIcon/types';

export type STableButtonProps = Omit<SButtonProps, 'color'> & {
  addText?: ReactNode;
  icon?: any;
  color?: string;
  tooltip?: string;
};

export type STableSearchProps = SInputProps & {
  onAddClick?: () => void;
  addText?: ReactNode;
  /** Renders after export/import controls and before the filter icon (e.g. Colunas). */
  toolbarBeforeFilter?: ReactNode;
  /** Inline addon after Adicionar (e.g. switch). Stays on the left. Default: empty. */
  toolbarAfterAdd?: ReactNode;
  /** Inline addon after Atualizar/Upload (e.g. Reset). Stays on the left. Default: empty. */
  toolbarAfterReload?: ReactNode;
  /** When true, `toolbarBeforeFilter` is pinned to the right with Filtrar. */
  pinToolbarWithFilter?: boolean;
  /** Atualizar / Upload usam fill de identidade. Default: cinza legado. */
  identitySquareActions?: boolean;
  filterButtonSx?: SxProps<Theme>;
  filterProps?: IFilterIconProps;
  onExportClick?: () => void;
  onImportClick?: () => void;
  onReloadClick?: () => void;
  loadingReload?: boolean;
  /** Bottom margin of the toolbar row. Default: 10. */
  mb?: number;
  // onImportClick?: () => void;
  boxProps?: Partial<BoxProps>;
  icon?: any;
  color?: string;
  sm?: boolean;
};
