import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

import type { FrpsLibraryTableRow } from './frps-explainability-library-filters.util';
import { FRPS_GLOBAL_ORIGIN_CHIP_SX } from './frps-explainability-library-ux.constants';

/**
 * Visualizar: VALIDATED usa o mesmo padrão filled do botão Gerar
 * (`variant="contained"` / primary). Demais status permanecem outlined.
 */
export function resolveFrpsLibraryViewButtonVariant(
  status: FrpsLibraryTableRow['status'],
): 'contained' | 'outlined' {
  return status === 'VALIDATED' ? 'contained' : 'outlined';
}

/**
 * Chip Origem: GLOBAL com contraste laranja/branco (mesmo sx do Canônico);
 * LOCAL permanece outlined default.
 */
export function resolveFrpsLibraryOriginChipProps(
  origin: FrpsCatalogAdminItem['origin'],
):
  | { sx: typeof FRPS_GLOBAL_ORIGIN_CHIP_SX }
  | { color: 'default'; variant: 'outlined' } {
  if (origin === 'GLOBAL') {
    return { sx: FRPS_GLOBAL_ORIGIN_CHIP_SX };
  }
  return { color: 'default', variant: 'outlined' };
}
