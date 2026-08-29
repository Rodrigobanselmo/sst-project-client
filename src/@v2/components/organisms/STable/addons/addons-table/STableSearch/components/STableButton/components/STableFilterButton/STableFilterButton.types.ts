import { SButtonProps } from '@v2/components/atoms/SButton/SButton.types';

export type STableFilterButtonProps = {
  onClick?: () => void;
  text?: string;
  popperTile?: string;
  children: React.ReactNode;
  /** Opt-in visual (ex.: pílula de utilidade). Default: visual legado. */
  tableButtonProps?: Partial<SButtonProps>;
};
