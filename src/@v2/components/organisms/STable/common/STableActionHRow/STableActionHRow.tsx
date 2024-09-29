import { FC, PropsWithChildren, ReactNode, useRef } from 'react';

import { Box, BoxProps } from '@mui/material';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SIconUnfolderMore } from '@v2/assets/icons/SIconUnfolderMore/SIconUnfolderMore';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { IOrderDirection } from '@v2/types/order-by-params.type';
import { STableHRow } from '../STableHRow/STableHRow';

interface ISTableActionHRowProps extends PropsWithChildren {
  boxProps?: BoxProps;
  direction?: IOrderDirection;
  menu: (props: { close: () => void }) => ReactNode;
}

export const STableActionHRow: FC<ISTableActionHRowProps> = ({
  children,
  boxProps,
  direction,
  menu,
}) => {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  return (
    <>
      <STableHRow
        boxProps={{ ...boxProps, onClick: toggle }}
        clickable={true}
        anchorEl={anchorEl}
      >
        {children}
        {(!direction || direction == 'none') && <SIconUnfolderMore />}
        {direction == 'desc' && <SIconSortArrowUp />}
        {direction == 'asc' && <SIconSortArrowDown />}
      </STableHRow>
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={isOpen}
        close={close}
        color="paper"
      >
        {menu({ close })}
      </SPopperArrow>
    </>
  );
};
