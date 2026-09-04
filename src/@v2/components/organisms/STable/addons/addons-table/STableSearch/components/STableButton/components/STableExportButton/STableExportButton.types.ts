import { SButtonProps } from '@v2/components/atoms/SButton/SButton.types';

export type STableExportMenuItem = {
  id: string;
  label: string;
  onClick: () => Promise<void> | void;
};

export type STableExportButtonProps = {
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  menuItems?: STableExportMenuItem[];
  text?: string;
  disabled?: boolean;
  /** Opt-in visual (ex.: pílula de utilidade). Default: color=info legado. */
  tableButtonProps?: Partial<SButtonProps>;
};
