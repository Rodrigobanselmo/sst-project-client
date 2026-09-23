import { Box, BoxProps } from '@mui/material';
import { CharacterizationEnvironmentsTabContent } from '@v2/pages/companies/characterizations/components/CharacterizationEnvironmentsTabContent/CharacterizationEnvironmentsTabContent';
import { RiskPrioritizationTabContent } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationTabContent';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsRiskTableList } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTableList';
import { GhoGseTabContent } from 'components/organisms/modals/ModalAddGHO';
import { ProtocolsRiskTable } from 'components/organisms/tables/ProtocolsRiskTable/ProtocolsRiskTable';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { Wizard } from 'react-use-wizard';

import {
  CharacterizationSubareaNavItem,
  CharacterizationSubTabEnum,
  getAssistenteGseHref,
  getCharacterizationAiProfilesHref,
  getCharacterizationSubareaNavItems,
  getCharacterizationTabFromWizardStep,
  getCharacterizationWizardStep,
  getChemicalProductsHref,
  parseCharacterizationActiveTab,
} from 'core/constants/characterization-navigation.constants';
import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useEnsureCharacterizationTabWorkspace } from 'core/hooks/useEnsureCharacterizationTabWorkspace';
import { useAccess } from 'core/hooks/useAccess';
import { useCharacterizationInlineEditorOptional } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/context/CharacterizationInlineEditorContext';
import { RiskToolByEntityTabContent } from './RiskToolByEntityTabContent';

const formatEstablishmentLabel = (workspace?: {
  name?: string | null;
  abbreviation?: string | null;
} | null) => {
  if (!workspace?.name?.trim()) return null;
  const name = workspace.name.trim();
  const abbreviation = workspace.abbreviation?.trim();
  return abbreviation ? `${name} — ${abbreviation}` : name;
};

function isCharacterizationTabNavItem(
  item: CharacterizationSubareaNavItem,
): item is Extract<CharacterizationSubareaNavItem, { kind: 'tab' }> {
  return item.kind === 'tab';
}

function CharacterizationSubTabPanel(props: {
  tab: CharacterizationSubTabEnum;
  workspaceId?: string;
  isWorkspaceFilterReady: boolean;
  workspaceLabel: string | null;
  isAllEstablishments: boolean;
}) {
  switch (props.tab) {
    case CharacterizationSubTabEnum.RISKS:
      return (
        <RiskCompanyTable
          workspaceId={props.workspaceId}
          queryEnabled={props.isWorkspaceFilterReady}
          companyFlowSticky
          companyFlowBelowTabs
        />
      );
    case CharacterizationSubTabEnum.GSE:
      return (
        <GhoGseTabContent
          workspaceId={props.workspaceId}
          companyFlowSticky
          companyFlowBelowTabs
        />
      );
    case CharacterizationSubTabEnum.ENVIRONMENTS:
      return (
        <CharacterizationEnvironmentsTabContent
          companyFlowSticky
          companyFlowBelowTabs
        />
      );
    case CharacterizationSubTabEnum.ENTITY_RISKS:
      return <RiskToolByEntityTabContent />;
    case CharacterizationSubTabEnum.PRIORITIZATION:
      return (
        <RiskPrioritizationTabContent
          workspaceId={props.workspaceId}
          queryEnabled={props.isWorkspaceFilterReady}
        />
      );
    case CharacterizationSubTabEnum.EXAMS:
      return (
        <>
          <ExamsRiskTable
            companyFlowSticky
            companyFlowBelowTabs
            enableBulkActions
            showPcmsoStatus
            workspaceId={props.workspaceId}
            workspaceLabel={props.workspaceLabel}
            isAllEstablishments={props.isAllEstablishments}
          />
          <ExamsRiskTableList companyFlowSticky companyFlowBelowTabs />
        </>
      );
    case CharacterizationSubTabEnum.PROTOCOLS:
      return <ProtocolsRiskTable companyFlowSticky companyFlowBelowTabs />;
    default: {
      const _exhaustive: never = props.tab;
      return _exhaustive;
    }
  }
}

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
  const { workspaceId, isWorkspaceFilterReady, isAllEstablishments } =
    useEnsureCharacterizationTabWorkspace({
      companyId,
      companyWorkspaces: company?.workspace,
      enabled: true,
    });

  const workspaceLabel = useMemo(() => {
    if (!workspaceId) return null;
    const fromCompany = company?.workspace?.find(
      (workspace) => workspace.id === workspaceId,
    );
    return formatEstablishmentLabel(fromCompany);
  }, [company?.workspace, workspaceId]);

  const activeTab = parseCharacterizationActiveTab(query?.active);
  const wizardStep = getCharacterizationWizardStep(activeTab);
  const inlineEditor = useCharacterizationInlineEditorOptional();
  const isInlineCharacterizationEdit = inlineEditor?.isInlineEditOpen ?? false;
  const { isMaster } = useAccess();

  const navItems = getCharacterizationSubareaNavItems({ showAiProfiles: isMaster });
  const tabNavItems = navItems.filter(isCharacterizationTabNavItem);
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
                if (item?.kind === 'external' && item.id === 'assistente-gse') {
                  if (!companyId) return;
                  const tabWorkspaceId =
                    (router.query.tabWorkspaceId as string | undefined) ||
                    workspaceId ||
                    undefined;
                  void router.push(
                    getAssistenteGseHref({
                      companyId,
                      tabWorkspaceId,
                    }),
                  );
                  return;
                }
                if (
                  item?.kind === 'external' &&
                  item.id === 'characterization-ai-profiles'
                ) {
                  if (!companyId) return;
                  const tabWorkspaceId =
                    (router.query.tabWorkspaceId as string | undefined) ||
                    workspaceId ||
                    undefined;
                  void router.push(
                    getCharacterizationAiProfilesHref({
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
        {tabNavItems.map((item) => (
          <CharacterizationSubTabPanel
            key={item.tab}
            tab={item.tab}
            workspaceId={workspaceId}
            isWorkspaceFilterReady={isWorkspaceFilterReady}
            workspaceLabel={workspaceLabel}
            isAllEstablishments={isAllEstablishments}
          />
        ))}
      </Wizard>
    </Box>
  );
};
