import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { ActionPlanHeaderMenu } from '../ActionPlanTableHeaderMenu/ActionPlanHeaderMenu';
import { IActionPlanHeaderRowrops } from './ActionPlanHeaderRow.types';

export const ActionPlanHeaderRow: FC<IActionPlanHeaderRowrops> = ({
  orderByMap,
  setOrderBy,
  field,
  isFiltered,
  onClean,
  text,
  onHidden,
  justify,
  filters,
}) => {
  return (
    <STableActionHRow
      isFiltered={isFiltered}
      boxProps={{ justifyContent: justify }}
      direction={field ? orderByMap[field] : undefined}
      menu={({ close }) => (
        <ActionPlanHeaderMenu
          filters={filters}
          close={close}
          onHidden={onHidden}
          onClean={onClean}
          setOrderBy={
            setOrderBy && field
              ? (direction) =>
                  setOrderBy({
                    field: field,
                    order: direction,
                  })
              : undefined
          }
        />
      )}
    >
      {text}
    </STableActionHRow>
  );
};
