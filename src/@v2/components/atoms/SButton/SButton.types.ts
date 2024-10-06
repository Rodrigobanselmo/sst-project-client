export type SButtonProps = {
  onClick: () => void;
  text?: string;
  tooltip?: string;
  icon?: any;
  color?: 'normal' | 'success' | 'info' | 'primary';
  variant?: 'text' | 'outlined' | 'contained';
};
