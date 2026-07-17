import { Box, BoxProps } from '@mui/material';
import { CharacterizationEnvironmentsTabContent } from '@v2/pages/companies/characterizations/components/CharacterizationEnvironmentsTabContent/CharacterizationEnvironmentsTabContent';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsRiskTableList } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTableList';
import { GhoGseTabContent } from 'components/organisms/modals/ModalAddGHO';
import { ProtocolsRiskTable } from 'components/organisms/tables/ProtocolsRiskTable/ProtocolsRiskTable';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { useRouter } from 'next/router';
import { Wizard } from 'react-use-wizard';

import {
  getCharacterizationSubareaNavItems,
  getCharacterizationTabFromWizardStep,
  getCharacterizationWizardStep,
  getChemicalProductsHref,
  parseCharacterizationActiveTab,
} from 'core/constants/characterization-navigation.constants';
import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useEnsureCharacterizationTabWorkspace } from 'core/hooks/useEnsureCharacterizationTabWorkspace';
import { useCharacterizationInlineEditorOptional } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/context/CharacterizationInlineEditorContext';
import { RiskToolByEntityTabContent } from './RiskToolByEntityTabContent';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const CharacterizationStage = ({
  query,
  sx,
  company,
  ...props
}: ICompanyStage) => {
  // Hierarchy + GHO/all are loaded on demand by RiskTool (Vínculo, GSE editor,
  // Elementos > Fatores). Prefetching here blocked the default Riscos tab.
  const router = useRouter();
  const companyId = (query?.companyId as string | undefined) || company?.id;
  const { workspaceId, isWorkspaceFilterReady } =
    useEnsureCharacterizationTabWorkspace({
      companyId,
      companyWorkspaces: company?.workspace,
      enabled: true,
    });
  const activeTab = parseCharacterizationActiveTab(query?.active);
  const wizardStep = getCharacterizationWizardStep(activeTab);
  const inlineEditor = useCharacterizationInlineEditorOptional();
  const isInlineCharacterizationEdit = inlineEditor?.isInlineEditOpen ?? false;

  const navItems = getCharacterizationSubareaNavItems();
  const tabOptions = navItems.map((item) => ({
    label: item.label,
  }));

  return (
    <Box
      {...props}
      sx={{
        ...(isInlineCharacterizationEdit && {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          mt: 0,
        }),
        ...(Array.isArray(sx) ? Object.assign({}, ...sx) : sx),
      }}
    >
      <Wizard
        header={
          <CompanyFlowStickySubheader>
            <WizardTabs
              shadow
              active={wizardStep}
              options={tabOptions}
              onChangeTab={(step, goToStep) => {
                const item = navItems[step];
                if (item?.kind === 'external' && item.id === 'chemical-products') {
                  if (!companyId) return;
                  const tabWorkspaceId =
                    (router.query.tabWorkspaceId as string | undefined) ||
                    workspaceId ||
                    undefined;
                  void router.push(
                    getChemicalProductsHref({
                      companyId,
                      tabWorkspaceId,
                    }),
                  );
                  return;
                }

                const tab = getCharacterizationTabFromWizardStep(step);
                if (tab == null) return;

                goToStep(step);
                void router.replace(
                  {
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      active: String(tab),
                    },
                  },
                  undefined,
                  { shallow: true },
                );
              }}
            />
          </CompanyFlowStickySubheader>
        }
      >
        {/* Steps follow CHARACTERIZATION_SUBAREA_TABS display order */}
        <>
          <RiskCompanyTable
            workspaceId={workspaceId}
            queryEnabled={isWorkspaceFilterReady}
            companyFlowSticky
            companyFlowBelowTabs
          />
        </>
        <>
          <GhoGseTabContent
            workspaceId={workspaceId}
            companyFlowSticky
            companyFlowBelowTabs
          />
        </>
        <>
          <CharacterizationEnvironmentsTabContent
            companyFlowSticky
            companyFlowBelowTabs
          />
        </>
        <>
          <ExamsRiskTable
            companyFlowSticky
            companyFlowBelowTabs
            enableBulkActions
            showPcmsoStatus
            workspaceId={workspaceId}
          />
          <ExamsRiskTableList companyFlowSticky companyFlowBelowTabs />
        </>
        <>
          <ProtocolsRiskTable companyFlowSticky companyFlowBelowTabs />
        </>
        <>
          <RiskToolByEntityTabContent />
        </>
      </Wizard>
    </Box>
  );
};
