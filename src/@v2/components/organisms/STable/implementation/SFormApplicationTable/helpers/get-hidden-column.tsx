import { FormApplicationColumnsEnum as columnsEnum } from '../enums/form-application-columns.enum';
import { FormApplicationColumnMap as columnMap } from '../maps/fomr-application-column-map';

export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  columnsEnum: columnsEnum,
) => {
  return columnsEnum in hiddenColumns
    ? hiddenColumns[columnsEnum] && !columnMap[columnsEnum].alwaysVisible
    : columnMap[columnsEnum].startHidden;
};
