export interface SelectedTableItemProps {
  name: string;
  tooltip?: string;
  handleRemove?: () => void;
  handleEdit?: () => void;
  /** Abre detalhe completo do CA (não substitui o clique de edição). */
  handleInfo?: () => void;
  infoTooltip?: string;
  isExpired?: boolean;
}
