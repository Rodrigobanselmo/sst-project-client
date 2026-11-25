import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { CompanyWorkspaceContextualNav } from 'components/organisms/main/CompanyFlow/CompanyWorkspaceContextualNav';
import {
  CompanyWorkspaceCardsProvider,
  useCompanyWorkspaceCardsCollapsed,
} from 'core/hooks/useCompanyWorkspaceCardsCollapsed';
import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';

type Props = {
  /** Quando true, não renderiza nada (ex.: editor inline de Elementos). */
  hidden?: boolean;
  forceCharacterizationActive?: boolean;
};

function CompanyWorkspaceSummarySectionInner({
  hidden = false,
  forceCharacterizationActive = true,
}: Props) {
  const { collapsed } = useCompanyWorkspaceCardsCollapsed();
  const companyStep = useCompanyStep({ loadSummaryMetrics: false });
  useFetchFeedback(companyStep.isLoading && !companyStep.company?.id);

  if (hidden) return null;

  return (
    <Box sx={{ mb: collapsed ? 0 : 1 }}>
      <SFlex
        align="center"
        justify="space-between"
        gap={1.5}
        sx={{ width: '100%', mb: 1, flexWrap: { xs: 'wrap', md: 'nowrap' } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CompanyWorkspaceContextualNav companyId={companyStep.company?.id} />
        </Box>
      </SFlex>
    </Box>
  );
}

/**
 * Cards + toggle + navegação contextual para rotas externas da Caracterização
 * (Produtos Químicos, Assistente de GSE) que não montam CompanyPageLayout.
 */
export function CharacterizationSummarySection(props: Props) {
  return (
    <CompanyWorkspaceCardsProvider>
      <CompanyWorkspaceSummarySectionInner {...props} />
    </CompanyWorkspaceCardsProvider>
  );
}

/** Alias semântico. */
export const CompanyWorkspaceSummarySection = CharacterizationSummarySection;
