import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const CompanyStage = ({ companyStepMemo, ...props }: ICompanyStage) => {
  return (
    <Box {...props}>
      <SText mt={20}>Dados da empresa</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {companyStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>

      <WorkspaceTable hideModal />
    </Box>
  );
};
