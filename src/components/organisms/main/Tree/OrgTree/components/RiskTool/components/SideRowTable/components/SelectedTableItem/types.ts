export interface SelectedTableItemProps {
  name: string;
  tooltip?: string;
  handleRemove: () => void;
  handleEdit?: () => void;
  isExpired?: boolean;
}
