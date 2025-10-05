import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { SCompanyPermissions } from 'components/molecules/SCompanyPermissions/SCompanyPermissions';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { useAuth } from 'core/contexts/AuthContext';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useAccess } from 'core/hooks/useAccess';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const CompanyStage = ({ companyStepMemo, ...props }: ICompanyStage) => {
  const { isMaster } = useAccess();
  return (
    <Box {...props}>
      <SText mt={20}>Dados da empresa</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {companyStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>
      {isMaster && (
        <>
          <SText mt={20}>Permissões de uso</SText>
          <SCompanyPermissions mt={5} ml={6} mb={-10} />
        </>
      )}

      <WorkspaceTable hideModal />
    </Box>
  );
};
