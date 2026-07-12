import { SxProps } from '@mui/material';

import { RecTypeEnum } from 'project/enum/recType.enum';
import { StatusEnum } from 'project/enum/status.enum';

export interface SelectedTableItemProps {
  name: string;
  tooltip?: string;
  handleRemove?: () => void;
  handleEdit?: () => void;
  /** Abre detalhe completo do CA (não substitui o clique de edição). */
  handleInfo?: () => void;
  infoTooltip?: string;
  isExpired?: boolean;
  /** Soft tint for Plano de Ação status (recomendação / medida derivada). */
  itemTintSx?: SxProps;
  /** Status explícito do payload para cor da caixa (sem fallback Pendente). */
  planStatus?: StatusEnum;
  /**
   * Status exibido no tooltip do plano; se omitido, usa `planStatus`.
   * Recomendações passam status com fallback Pendente via coluna.
   */
  planTooltipStatus?: StatusEnum;
  /** Texto extra no tooltip quando a exclusão está bloqueada (ex.: plano fora de Pendente). */
  planDeleteBlockedHint?: string;
  /**
   * Quando definido, controla a observação “transformada em medida…” no tooltip do plano:
   * `true` só com derivação real + status DONE no chip; `false` oculta; omitido mantém comportamento legado (só pelo chip).
   */
  showPlanDerivedTransformedNote?: boolean;
  /** Alerta quando a recomendação não tem `recType` (ADM/ENG/EPI). */
  showMissingTypeWarning?: boolean;
  missingTypeTooltip?: string;
  /** Correção rápida do tipo via Popover no ícone de alerta. */
  onQuickClassifyRecType?: (recType: RecTypeEnum) => void | Promise<void>;
  quickClassifyLoading?: boolean;
}
