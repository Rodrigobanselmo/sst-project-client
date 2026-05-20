import { ReactNode } from 'react';

import { Box } from '@mui/material';

import {
  COMPANY_FLOW_MODULE_TABS_HEIGHT,
  COMPANY_FLOW_STICKY_SUBHEADER_Z_INDEX,
} from './company-flow-layout.constants';

type Props = {
  children: ReactNode;
  /** Cola abaixo das abas do módulo (Caracterização, Documentos, etc.). */
  belowModuleTabs?: boolean;
};

export function CompanyFlowStickySubheader({
  children,
  belowModuleTabs = false,
}: Props): JSX.Element {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: belowModuleTabs ? COMPANY_FLOW_MODULE_TABS_HEIGHT : 0,
        zIndex: COMPANY_FLOW_STICKY_SUBHEADER_Z_INDEX,
        bgcolor: 'background.default',
        pb: belowModuleTabs ? 1 : 0,
        ...(belowModuleTabs && {
          boxShadow: (theme) => `0 1px 0 ${theme.palette.divider}`,
        }),
      }}
    >
      {children}
    </Box>
  );
}
