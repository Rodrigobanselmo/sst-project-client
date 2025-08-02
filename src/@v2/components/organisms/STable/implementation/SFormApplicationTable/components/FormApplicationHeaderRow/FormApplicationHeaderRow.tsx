import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { IFormApplicationHeaderRowProps } from './FormApplicationHeaderRow.types';
import { FormApplicationHeaderMenu } from '../FormApplicationHeaderMenu/FormApplicationHeaderMenu';

export const FormApplicationHeaderRow: FC<IFormApplicationHeaderRowProps> = ({
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
        <FormApplicationHeaderMenu
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
