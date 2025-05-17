import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { IFormModelHeaderRowProps } from './FormModelHeaderRow.types';
import { FormModelHeaderMenu } from '../FormModelHeaderMenu/FormModelHeaderMenu';

export const FormModelHeaderRow: FC<IFormModelHeaderRowProps> = ({
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
      direction={
        field && orderByMap
          ? orderByMap[field]
          : orderByMap
          ? undefined
          : 'hide'
      }
      menu={({ close }) => (
        <FormModelHeaderMenu
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
