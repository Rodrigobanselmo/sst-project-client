import { SxProps } from '@mui/material';

import { StatusEnum } from 'project/enum/status.enum';

export interface SelectedTableItemProps {
  name: string;
  tooltip?: string;
  handleRemove?: () => void;
  handleEdit?: () => void;
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
}
