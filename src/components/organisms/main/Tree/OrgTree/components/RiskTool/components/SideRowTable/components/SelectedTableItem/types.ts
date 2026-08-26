import { RecTypeEnum } from 'project/enum/recType.enum';

export interface SelectedTableItemProps {
  name: string;
  tooltip?: string;
  handleRemove?: () => void;
  handleEdit?: () => void;
  /** Abre detalhe completo do CA (não substitui o clique de edição). */
  handleInfo?: () => void;
  infoTooltip?: string;
  isExpired?: boolean;
  /**
   * Tipo da recomendação já vinculado (`rec.recType`).
   * Quando informado (inclusive `null`), a coluna de ações vai para a direita
   * com o ícone de categoria acima da lixeira.
   */
  recType?: RecTypeEnum | string | null;
  /** Alerta quando a recomendação não tem `recType` (ADM/ENG/EPI). */
  showMissingTypeWarning?: boolean;
  missingTypeTooltip?: string;
  /** Correção rápida do tipo via Popover no ícone de alerta. */
  onQuickClassifyRecType?: (recType: RecTypeEnum) => void | Promise<void>;
  quickClassifyLoading?: boolean;
}
