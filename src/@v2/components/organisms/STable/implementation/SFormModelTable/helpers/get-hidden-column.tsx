import { FormModelColumnsEnum as columnsEnum } from '../enums/form-model-columns.enum';
import { FormModelColumnMap as columnMap } from '../maps/fomr-model-column-map';

export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  columnsEnum: columnsEnum,
) => {
  return columnsEnum in hiddenColumns
    ? hiddenColumns[columnsEnum] && !columnMap[columnsEnum].alwaysVisible
    : columnMap[columnsEnum].startHidden;
};
