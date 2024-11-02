import { FC } from 'react';

import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { CharacterizationHeaderMenu } from '../CharacterizationHeaderMenu/CharacterizationHeaderMenu';
import { ICharacterizationHeaderRowrops } from './CharacterizationHeaderRow.types';

export const CharacterizationHeaderRow: FC<ICharacterizationHeaderRowrops> = ({
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
      direction={orderByMap[field]}
      menu={({ close }) => (
        <CharacterizationHeaderMenu
          filters={filters}
          close={close}
          onHidden={onHidden}
          onClean={onClean}
          setOrderBy={(direction) =>
            setOrderBy({
              field: field,
              order: direction,
            })
          }
        />
      )}
    >
      {text}
    </STableActionHRow>
  );
};
