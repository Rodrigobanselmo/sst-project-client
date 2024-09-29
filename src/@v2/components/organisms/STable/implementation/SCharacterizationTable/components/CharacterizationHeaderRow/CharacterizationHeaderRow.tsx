import { FC } from 'react';

import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { STableActionHRow } from '@v2/components/organisms/STable/common/STableActionHRow/STableActionHRow';
import { CharacterizationHeaderMenu } from '../CharacterizationHeaderMenu/CharacterizationHeaderMenu';
import { ICharacterizationHeaderRowrops } from './CharacterizationHeaderRow.types';

export const CharacterizationHeaderRow: FC<ICharacterizationHeaderRowrops> = ({
  orderByMap,
  setOrderBy,
  field,
  text,
  justify,
}) => {
  return (
    <STableActionHRow
      boxProps={{ justifyContent: justify }}
      direction={orderByMap[field]}
      menu={({ close }) => (
        <CharacterizationHeaderMenu
          close={close}
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
