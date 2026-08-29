import Drawer from '@mui/material/Drawer';

import { useSidebarDrawer } from '../../../../core/contexts/SidebarContext';
import { SideBarNav } from './SideBarNav';
import { FlexStyle } from './styles';

export function Sidebar(): JSX.Element {
  const { isOpen, close, isTablet } = useSidebarDrawer();
  return (
    <>
      {isTablet ? (
        <Drawer
          open={isOpen}
          onClose={close}
          ModalProps={{
            keepMounted: false,
          }}
          PaperProps={{
            sx: {
              backgroundColor: 'sidebar.background',
              backgroundImage: 'none',
              borderRight: '1px solid',
              borderColor: 'background.divider',
            },
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
