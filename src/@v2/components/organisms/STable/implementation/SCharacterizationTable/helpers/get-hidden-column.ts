import { CharacterizationColumnsEnum as columnsEnum } from '../enums/characterization-columns.enum';
import { CharacterizationColumnMap as columnMap } from '../maps/characterization-column-map';

/**
 * Preferência explícita em `hiddenColumns` prevalece.
 * Sem chave salva → usa `startHidden` do mapa (padrão inicial).
 */
export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  column: columnsEnum,
) => {
  return column in hiddenColumns
    ? hiddenColumns[column] && !columnMap[column].alwaysVisible
    : !!columnMap[column].startHidden;
};
