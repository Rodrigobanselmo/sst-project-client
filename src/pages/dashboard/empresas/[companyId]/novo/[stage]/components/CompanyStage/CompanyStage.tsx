import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { SCompanyPermissions } from 'components/molecules/SCompanyPermissions/SCompanyPermissions';
import {
  companyFlowCompactPanelSx,
  companyFlowCompactShortcutButtonSx,
  COMPANY_FLOW_COMPACT_SHORTCUTS_FLEX_GAP,
} from 'components/organisms/main/CompanyFlow/company-flow-compact-shortcuts.styles';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useAccess } from 'core/hooks/useAccess';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const CompanyStage = ({ companyStepMemo, ...props }: ICompanyStage) => {
  const { isMaster } = useAccess();

  return (
    <Box
      {...props}
      sx={[
        { mt: -4 },
        ...(props.sx
          ? Array.isArray(props.sx)
            ? props.sx
            : [props.sx]
          : []),
      ]}
    >
      <Box sx={{ ...companyFlowCompactPanelSx, mt: 0, mb: 1.25 }}>
        <SText
          fontSize={11}
          fontWeight={600}
          color="text.secondary"
          lineHeight={1.2}
        >
          Gestão da Empresa
        </SText>
        <SFlex
          mt={0.75}
          gap={COMPANY_FLOW_COMPACT_SHORTCUTS_FLEX_GAP}
          flexWrap="wrap"
        >
          {companyStepMemo.map((actionProps) => (
            <SActionButton
              key={actionProps.text}
              {...actionProps}
              sx={companyFlowCompactShortcutButtonSx}
            />
          ))}
        </SFlex>
      </Box>

      {isMaster && (
        <>
          <SText mt={2} fontSize={11} fontWeight={600} color="text.secondary">
            Permissões de uso
          </SText>
          <SCompanyPermissions mt={1} ml={0} mb={1} />
        </>
      )}

      <WorkspaceTable hideModal />
    </Box>
  );
};
