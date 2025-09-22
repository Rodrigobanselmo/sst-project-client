import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { IFormParticipantsHeaderRowProps } from './FormParticipantsHeaderRow.types';
import { FormParticipantsHeaderMenu } from '../FormParticipantsHeaderMenu/FormParticipantsHeaderMenu';

export const FormParticipantsHeaderRow: FC<IFormParticipantsHeaderRowProps> = ({
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
        <FormParticipantsHeaderMenu
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
