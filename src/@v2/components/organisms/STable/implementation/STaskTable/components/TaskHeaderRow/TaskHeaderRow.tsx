import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { TaskHeaderMenu } from '../TaskTableHeaderMenu/TaskHeaderMenu';
import { ITaskHeaderRowProps } from './TaskHeaderRow.types';

export const TaskHeaderRow: FC<ITaskHeaderRowProps> = ({
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
        <TaskHeaderMenu
          filters={filters}
          close={close}
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
