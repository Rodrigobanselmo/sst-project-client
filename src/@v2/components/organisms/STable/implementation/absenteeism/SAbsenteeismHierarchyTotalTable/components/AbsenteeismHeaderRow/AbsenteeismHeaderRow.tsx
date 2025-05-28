import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { AbsenteeismHeaderMenu } from '../AbsenteeismTableHeaderMenu/AbsenteeismHeaderMenu';
import { IAbsenteeismHeaderRowProps } from './AbsenteeismHeaderRow.types';

export const AbsenteeismHeaderRow: FC<IAbsenteeismHeaderRowProps> = ({
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
        <AbsenteeismHeaderMenu
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
