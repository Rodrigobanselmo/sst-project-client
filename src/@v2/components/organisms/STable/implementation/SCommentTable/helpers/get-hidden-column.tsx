import { ActionPlanColumnsEnum as columnsEnum } from '../enums/comment-columns.enum';
import { ActionPlanColumnMap as columnMap } from '../maps/action-plan-column-map';

export const getHiddenColumn = (
  hiddenColumns: Record<columnsEnum, boolean>,
  columnsEnum: columnsEnum,
) => {
  return columnsEnum in hiddenColumns
    ? hiddenColumns[columnsEnum]
    : columnMap[columnsEnum].startHidden;
};