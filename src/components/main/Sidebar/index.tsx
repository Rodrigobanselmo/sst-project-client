import Drawer from '@mui/material/Drawer';

import { useSidebarDrawer } from '../../../core/contexts/SidebarContext';
import { SideBarNav } from './SideBarNav';
import { FlexStyle } from './styles';

export function Sidebar(): JSX.Element {
  const { isOpen, close, open, isMobile } = useSidebarDrawer();
  return (
    <>
      {isMobile ? (
        <Drawer
          open={isOpen}
          onClose={close}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <FlexStyle is_close={!isOpen ? 1 : 0} as="aside">
            <SideBarNav />
          </FlexStyle>
        </Drawer>
      ) : (
        <FlexStyle is_close={!isOpen ? 1 : 0} as="aside">
          <SideBarNav />
        </FlexStyle>
      )}
    </>
  );
}
