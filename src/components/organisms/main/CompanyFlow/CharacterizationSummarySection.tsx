import { Box } from '@mui/material';
import { CharacterizationSummaryToggle } from 'components/organisms/main/CompanyFlow/CharacterizationSummaryToggle';
import { CompanyHomeSummaryCards } from 'components/organisms/main/CompanyFlow/CompanyHomeSummaryCards';
import {
  CharacterizationSummaryCollapsedProvider,
  useCharacterizationSummaryCollapsed,
} from 'core/hooks/useCharacterizationSummaryCollapsed';
import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';

type Props = {
  /** Quando true, não renderiza nada (ex.: editor inline de Elementos). */
  hidden?: boolean;
  forceCharacterizationActive?: boolean;
};

function CharacterizationSummarySectionInner({
  hidden = false,
  forceCharacterizationActive = true,
}: Props) {
  const companyStep = useCompanyStep();
  const { collapsed } = useCharacterizationSummaryCollapsed();
  useFetchFeedback(companyStep.isLoading && !companyStep.company?.id);

  if (hidden) return null;

  return (
    <Box sx={{ mb: collapsed ? 0 : 1 }}>
      <CharacterizationSummaryToggle />
      {!collapsed ? (
        <CompanyHomeSummaryCards
          pageGroupMemo={companyStep.pageGroupMemo}
          launchCardsMemo={companyStep.launchCardsMemo}
          formsLaunchGroup={companyStep.formsLaunchGroup}
          showFormsLaunchGroup={companyStep.showFormsLaunchGroup}
          actionPlanLaunchGroup={companyStep.actionPlanLaunchGroup}
          showActionPlanLaunchGroup={companyStep.showActionPlanLaunchGroup}
          stage={companyStep.stage}
          company={companyStep.company}
          isGroupConsolidated={companyStep.isGroupConsolidated}
          forceCharacterizationActive={forceCharacterizationActive}
        />
      ) : null}
    </Box>
  );
}

/**
 * Cards + toggle para rotas externas da Caracterização
 * (Produtos Químicos, Assistente de GSE) que não montam CompanyPageLayout.
 * Provider próprio = uma fonte de verdade reativa nesta página.
 */
export function CharacterizationSummarySection(props: Props) {
  return (
    <CharacterizationSummaryCollapsedProvider>
      <CharacterizationSummarySectionInner {...props} />
    </CharacterizationSummaryCollapsedProvider>
  );
}
