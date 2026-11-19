import { Box, Tab, Tabs } from '@mui/material';
import { useRouter } from 'next/router';
import {
  CharacterizationSubTabEnum,
  parseCharacterizationActiveTab,
} from 'core/constants/characterization-navigation.constants';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { RiskPrioritizationTabContent } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationTabContent';
import { RiskInventoryTabContent } from '@v2/pages/companies/risk-inventory/RiskInventoryTabContent';
import { RiskToolByEntityTabContent } from 'pages/dashboard/empresas/[companyId]/novo/[stage]/components/CharacterizationStage/RiskToolByEntityTabContent';
import { RiskImportTabs } from './RiskImportTabs';

const tabs = [
  { value: CharacterizationSubTabEnum.RISKS, label: 'Visão geral' },
  { value: CharacterizationSubTabEnum.RISK_IMPORT, label: 'Importação' },
  { value: CharacterizationSubTabEnum.ENTITY_RISKS, label: 'Vínculo de riscos' },
  { value: CharacterizationSubTabEnum.PRIORITIZATION, label: 'Priorização' },
  {
    value: CharacterizationSubTabEnum.RISK_INVENTORY,
    label: 'Inventário de riscos',
  },
];

export function RiskAreaTabs({
  workspaceId,
  queryEnabled,
  isAllEstablishments,
}: {
  workspaceId?: string;
  queryEnabled: boolean;
  isAllEstablishments: boolean;
}) {
  const router = useRouter();
  const active = parseCharacterizationActiveTab(router.query.active);
  const value = tabs.some((tab) => tab.value === active)
    ? active
    : CharacterizationSubTabEnum.RISKS;
  return (
    <Box>
      <Tabs
        value={value}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Áreas de riscos"
        onChange={(_, next) => {
          void router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, active: String(next) },
            },
            undefined,
            { shallow: true },
          );
        }}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            id={`risk-area-tab-${tab.value}`}
            aria-controls={`risk-area-panel-${tab.value}`}
          />
        ))}
      </Tabs>
      {tabs.map((tab) => (
        <Box
          key={tab.value}
          role="tabpanel"
          id={`risk-area-panel-${tab.value}`}
          aria-labelledby={`risk-area-tab-${tab.value}`}
          hidden={value !== tab.value}
        >
          {tab.value === CharacterizationSubTabEnum.RISKS &&
            value === tab.value && (
              <RiskCompanyTable
                workspaceId={workspaceId}
                queryEnabled={queryEnabled}
                companyFlowSticky
                companyFlowBelowTabs
                enableSectorRiskPresenceMap
                openRiskToolByRiskV2
                isAllEstablishments={isAllEstablishments}
              />
            )}
          {tab.value === CharacterizationSubTabEnum.RISK_IMPORT && (
            <RiskImportTabs
              workspaceId={workspaceId}
              queryEnabled={queryEnabled}
            />
          )}
          {tab.value === CharacterizationSubTabEnum.ENTITY_RISKS &&
            value === tab.value && <RiskToolByEntityTabContent />}
          {tab.value === CharacterizationSubTabEnum.PRIORITIZATION &&
            value === tab.value && (
              <RiskPrioritizationTabContent
                workspaceId={workspaceId}
                queryEnabled={queryEnabled}
              />
            )}
          {tab.value === CharacterizationSubTabEnum.RISK_INVENTORY &&
            value === tab.value && (
              <RiskInventoryTabContent
                workspaceId={workspaceId}
                queryEnabled={queryEnabled}
              />
            )}
        </Box>
      ))}
    </Box>
  );
}
