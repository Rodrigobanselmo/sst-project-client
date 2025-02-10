import { DocumentControlColumnsEnum as columnsEnum } from '../enums/document-control-columns.enum';
import { DocumentControlColumnMap as columnMap } from '../maps/document-control-column-map';

export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  columnsEnum: columnsEnum,
) => {
  return columnsEnum in hiddenColumns
    ? hiddenColumns[columnsEnum] && !columnMap[columnsEnum].alwaysVisible
    : columnMap[columnsEnum].startHidden;
};
