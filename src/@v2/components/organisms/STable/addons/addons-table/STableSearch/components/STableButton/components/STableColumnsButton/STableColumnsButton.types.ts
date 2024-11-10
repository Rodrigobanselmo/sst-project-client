export type STableColumnsProps = {
  label: string;
  value: string;
  startHidden?: boolean;
};

export type STableColumnsButtonProps<T extends string> = {
  onClick?: () => void;
  text?: string;
  popperTile?: string;
  columns: STableColumnsProps[];
  setHiddenColumns: (hiddenColumns: Record<T, boolean>) => void;
  hiddenColumns: Record<T, boolean>;
  showLabel?: boolean;
};
