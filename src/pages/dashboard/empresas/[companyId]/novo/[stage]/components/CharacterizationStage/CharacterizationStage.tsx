import { Box, BoxProps } from '@mui/material';
import { CharacterizationTable } from '@v2/pages/companies/characterizations/components/CharacterizationTable/CharacterizationTable';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsRiskTableList } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTableList';
import { GhosTable } from 'components/organisms/tables/GhosTable/GhosTable';
import { ProtocolsRiskTable } from 'components/organisms/tables/ProtocolsRiskTable/ProtocolsRiskTable';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { Wizard } from 'react-use-wizard';

import {
  CharacterizationSubTabEnum,
  CHARACTERIZATION_SUB_TAB_LABELS,
  parseCharacterizationActiveTab,
} from 'core/constants/characterization-navigation.constants';
import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useHierarchyTreeLoad } from 'components/organisms/main/Tree/OrgTree/hooks/useHierarchyTreeLoad';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const CharacterizationStage = ({ query, ...props }: ICompanyStage) => {
  useHierarchyTreeLoad();
  const { workspaceId } = useTabWorkspaceId();
  const activeTab = parseCharacterizationActiveTab(query?.active);

  const tabOptions = [
    CharacterizationSubTabEnum.RISKS,
    CharacterizationSubTabEnum.ENVIRONMENTS,
    CharacterizationSubTabEnum.GSE,
    CharacterizationSubTabEnum.EXAMS,
    CharacterizationSubTabEnum.PROTOCOLS,
  ].map((tab) => ({
    label: CHARACTERIZATION_SUB_TAB_LABELS[tab],
  }));

  return (
    <Box {...props}>
      <Wizard
        header={
          <WizardTabs
            shadow
            onUrl
            active={activeTab}
            options={tabOptions}
          />
        }
      >
        <>
          <RiskCompanyTable workspaceId={workspaceId} />
        </>
        <>
          <CharacterizationTable />
        </>
        <>
          <GhosTable workspaceId={workspaceId} />
        </>
        <>
          <ExamsRiskTable />
          <ExamsRiskTableList />
        </>
        <>
          <ProtocolsRiskTable />
        </>
      </Wizard>
    </Box>
  );
};
