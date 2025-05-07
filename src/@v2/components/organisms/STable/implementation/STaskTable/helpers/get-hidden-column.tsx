import { TaskColumnsEnum as columnsEnum } from '../enums/task-columns.enum';
import { TaskColumnMap as columnMap } from '../maps/task-column-map';

export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  columnsEnum: columnsEnum,
) => {
  return columnsEnum in hiddenColumns
    ? hiddenColumns[columnsEnum] && !columnMap[columnsEnum].alwaysVisible
    : columnMap[columnsEnum].startHidden;
};
