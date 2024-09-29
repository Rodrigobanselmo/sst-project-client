import { FC } from 'react';

import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SPopperMenu } from '@v2/components/organisms/SPopper/addons/SPopperMenu/SPopperMenuItem';
import { SPopperMenuItemAscending } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemAscending';
import { SPopperMenuItemDesceding } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemDesceding';
import { SPopperMenuItemHideColumn } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemHideColumn';
import { ICharacterizationHeaderMenuProps } from './CharacterizationHeaderMenu.types';
import { SPopperMenuItemClean } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemClean';

export const CharacterizationHeaderMenu: FC<
  ICharacterizationHeaderMenuProps
> = ({ close, setOrderBy }) => {
  return (
    <SPopperMenu>
      <SPopperMenuItemAscending
        onClick={() => {
          setOrderBy('asc');
          close();
        }}
      />
      <SPopperMenuItemDesceding
        onClick={() => {
          setOrderBy('desc');
          close();
        }}
      />
      <SPopperMenuItemHideColumn onClick={close} />
      <SDivider />
      <SPopperMenuItemClean
        onClick={() => {
          setOrderBy('none');
          close();
        }}
      />
    </SPopperMenu>
  );
};
