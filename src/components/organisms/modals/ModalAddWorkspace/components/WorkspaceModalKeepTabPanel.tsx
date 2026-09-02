import { Box } from '@mui/material';
import { ReactNode } from 'react';

type WorkspaceModalKeepTabPanelProps = {
  value: number;
  index: number;
  children: ReactNode;
};

export const WorkspaceModalKeepTabPanel = ({
  value,
  index,
  children,
}: WorkspaceModalKeepTabPanelProps) => {
  const isActive = value === index;

  return (
    <Box
      role="tabpanel"
      hidden={!isActive}
      id={`workspace-tabpanel-${index}`}
      aria-labelledby={`workspace-tab-${index}`}
      sx={{ display: isActive ? 'block' : 'none' }}
    >
      {children}
    </Box>
  );
};
