import { useSidebarDrawer } from 'core/contexts/SidebarContext';
import { IdsEnum } from 'core/enums/ids.enums';
import SText from 'components/atoms/SText';
import SArrowUpFilterIcon from 'assets/icons/SArrowUpFilterIcon';

import { STBox } from '../Tenant/Tenant';
import { useWorkspaceTenant } from '../Tenant/hooks/useWorkspaceTenant';

export function WorkspaceTenant(): JSX.Element | null {
  const { isTablet } = useSidebarDrawer();
  const { showWorkspaceSelector, workspaceLabel, onWorkspaceDropSelect } =
    useWorkspaceTenant();

  if (!showWorkspaceSelector) return null;

  return (
    <STBox
      ml={2}
      display={isTablet ? 'none' : 'flex'}
      onClick={(e) => {
        e.stopPropagation();
        onWorkspaceDropSelect();
      }}
      id={IdsEnum.WORKSPACE_SELECT_NAVBAR}
    >
      <SArrowUpFilterIcon
        sx={{
          fontSize: '23px',
          mt: 0,
          mr: 1,
          transform: 'rotate(-180deg)',
        }}
      />
      <SText maxWidth={200} minWidth={120} lineNumber={1} fontSize={11}>
        {workspaceLabel}
      </SText>
    </STBox>
  );
}
