export interface SelectedTableItemProps {
  name: string;
  tooltip?: string;
  handleRemove: () => void;
  isExpired?: boolean;
}
