import { AbsenteeismColumnsEnum as columnsEnum } from '../enums/absenteeism-columns.enum';
import { AbsenteeismColumnMap as columnMap } from '../maps/absenteeism-column-map';

export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  columnsEnum: columnsEnum,
) => {
  return columnsEnum in hiddenColumns
    ? hiddenColumns[columnsEnum] && !columnMap[columnsEnum].alwaysVisible
    : columnMap[columnsEnum].startHidden;
};
