import { FC } from 'react';

import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SPopperMenu } from '@v2/components/organisms/SPopper/addons/SPopperMenu/SPopperMenu';
import { SPopperMenuItemAscending } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemAscending';
import { SPopperMenuItemDesceding } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemDesceding';
import { SPopperMenuItemHideColumn } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemHideColumn';
import { IActionPlanHeaderMenuProps } from './ActionPlanHeaderMenu.types';
import { SPopperMenuItemClean } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/components/SPopperMenuItemClean';

export const ActionPlanHeaderMenu: FC<IActionPlanHeaderMenuProps> = ({
  close,
  setOrderBy,
  onClean,
  onHidden,
  filters,
}) => {
  return (
    <SPopperMenu>
      {filters}
      {setOrderBy && (
        <SPopperMenuItemAscending
          onClick={() => {
            setOrderBy('asc');
            close();
          }}
        />
      )}
      {setOrderBy && (
        <SPopperMenuItemDesceding
          onClick={() => {
            setOrderBy('desc');
            close();
          }}
        />
      )}
      <SPopperMenuItemHideColumn
        disabled={!onHidden}
        onClick={() => {
          onHidden?.();
          close();
        }}
      />
      <SDivider />
      <SPopperMenuItemClean
        onClick={() => {
          setOrderBy?.('none');
          onClean?.();
          close();
        }}
      />
    </SPopperMenu>
  );
};